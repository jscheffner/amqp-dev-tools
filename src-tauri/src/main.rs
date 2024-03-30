// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use lapin::{Connection, ConnectionProperties};
use tauri::{Manager, State};

#[derive(Default)]
struct AmqpConnection(Mutex<Option<Connection>>);

#[tauri::command]
async fn amqp_connect(
    app: tauri::AppHandle,
    amqp_connection: State<'_, AmqpConnection>,
    connection_string: String,
) -> Result<(), String> {
    let connection =
        Connection::connect(connection_string.as_str(), ConnectionProperties::default())
            .await
            .map_err(|err| err.to_string())?;

    connection.on_error(move |err| {
        let _ = app.emit_all("amqp:disconnected", err.to_string());
    });
    *amqp_connection.0.lock().unwrap() = Some(connection);
    Ok(())
}

#[tauri::command]
async fn amqp_disconnect(
    app: tauri::AppHandle,
    amqp_connection: State<'_, AmqpConnection>,
) -> Result<(), String> {
    *amqp_connection.0.lock().unwrap() = None;
    let _ = app.emit_all("amqp:disconnected", ());
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AmqpConnection(Default::default()))
        .invoke_handler(tauri::generate_handler![amqp_connect, amqp_disconnect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lapin::options::BasicPublishOptions;
use lapin::BasicProperties;
use lapin::{
    options::ExchangeDeclareOptions, types::FieldTable, Connection, ConnectionProperties,
    ExchangeKind,
};
use tauri::async_runtime::Mutex;
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
    *amqp_connection.0.lock().await = Some(connection);
    Ok(())
}

#[tauri::command]
async fn amqp_disconnect(
    app: tauri::AppHandle,
    amqp_connection: State<'_, AmqpConnection>,
) -> Result<(), String> {
    *amqp_connection.0.lock().await = None;
    let _ = app.emit_all("amqp:disconnected", ());
    Ok(())
}

#[tauri::command]
async fn amqp_declare_exchange(
    amqp_connection: State<'_, AmqpConnection>,
    exchange_name: String,
    exchange_type: ExchangeKind,
) -> Result<(), String> {
    let connection_guard = amqp_connection.0.lock().await;
    let conn = connection_guard.as_ref().unwrap();
    let ch = conn.create_channel().await.map_err(|err| err.to_string())?;
    let _ = ch
        .exchange_declare(
            exchange_name.as_str(),
            exchange_type,
            ExchangeDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .map_err(|err| err.to_string());
    Ok(())
}

#[tauri::command]
async fn amqp_publish(
    amqp_connection: State<'_, AmqpConnection>,
    exchange_name: String,
    routing_key: String,
    message: String,
) -> Result<(), String> {
    let connection_guard = amqp_connection.0.lock().await;
    let conn = connection_guard.as_ref().unwrap();
    let ch = conn.create_channel().await.map_err(|err| err.to_string())?;
    let _ = ch
        .basic_publish(
            exchange_name.as_str(),
            routing_key.as_str(),
            BasicPublishOptions::default(),
            message.as_bytes(),
            BasicProperties::default(),
        )
        .await
        .map_err(|err| err.to_string());
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AmqpConnection(Default::default()))
        .invoke_handler(tauri::generate_handler![
            amqp_connect,
            amqp_disconnect,
            amqp_declare_exchange,
            amqp_publish
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashSet;
use std::str::from_utf8;

use lapin::message::DeliveryResult;
use lapin::options::{
    BasicAckOptions, BasicCancelOptions, BasicConsumeOptions, BasicPublishOptions,
    QueueBindOptions, QueueDeclareOptions, QueueDeleteOptions,
};
use lapin::{
    options::ExchangeDeclareOptions, types::FieldTable, Connection, ConnectionProperties,
    ExchangeKind,
};
use lapin::{BasicProperties, Channel};
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::{Manager, State};

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Lapin(#[from] lapin::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Default)]
struct AmqpConnection(Mutex<Option<Connection>>);
struct AmqpChannel(Mutex<Option<Channel>>);
struct AmqpQueues(Mutex<HashSet<String>>);

#[tauri::command]
async fn amqp_connect(
    app: tauri::AppHandle,
    amqp_connection: State<'_, AmqpConnection>,
    amqp_channel: State<'_, AmqpChannel>,
    connection_string: String,
) -> Result<(), Error> {
    let connection =
        Connection::connect(connection_string.as_str(), ConnectionProperties::default()).await?;

    connection.on_error(move |err| {
        let _ = app.emit_all("amqp:disconnected", err.to_string());
    });
    let channel = connection.create_channel().await?;
    *amqp_connection.0.lock().await = Some(connection);
    *amqp_channel.0.lock().await = Some(channel);
    Ok(())
}

#[tauri::command]
async fn amqp_disconnect(
    app: tauri::AppHandle,
    amqp_connection: State<'_, AmqpConnection>,
    amqp_channel: State<'_, AmqpChannel>,
    declared_queues: State<'_, AmqpQueues>,
) -> Result<(), Error> {
    let channel_guard = amqp_channel.0.lock().await;
    let ch = channel_guard.as_ref().unwrap();
    let mut queues = declared_queues.0.lock().await;
    for queue in queues.drain() {
        println!("Deleting queue {}", &queue);
        let _ = ch
            .queue_delete(&queue, QueueDeleteOptions::default())
            .await?;
    }
    *amqp_connection.0.lock().await = None;
    let _ = app.emit_all("amqp:disconnected", ());
    Ok(())
}

#[tauri::command]
async fn amqp_declare_exchange(
    amqp_channel: State<'_, AmqpChannel>,
    exchange_name: String,
    exchange_type: ExchangeKind,
) -> Result<(), Error> {
    let channel_guard = amqp_channel.0.lock().await;
    let ch = channel_guard.as_ref().unwrap();
    let _ = ch
        .exchange_declare(
            exchange_name.as_str(),
            exchange_type,
            ExchangeDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;
    Ok(())
}

#[tauri::command]
async fn amqp_publish(
    amqp_channel: State<'_, AmqpChannel>,
    exchange_name: String,
    routing_key: String,
    message: String,
) -> Result<(), Error> {
    let channel_guard = amqp_channel.0.lock().await;
    let ch = channel_guard.as_ref().unwrap();
    let _ = ch
        .basic_publish(
            exchange_name.as_str(),
            routing_key.as_str(),
            BasicPublishOptions::default(),
            message.as_bytes(),
            BasicProperties::default(),
        )
        .await?;
    Ok(())
}

#[tauri::command]
async fn amqp_consume(
    app: tauri::AppHandle,
    amqp_channel: State<'_, AmqpChannel>,
    declared_queues: State<'_, AmqpQueues>,
    exchange: String,
    routing_key: String,
    id: String,
) -> Result<(), Error> {
    let channel_guard = amqp_channel.0.lock().await;
    let ch = channel_guard.as_ref().unwrap();
    let queue_name = format!("amqp-dev-tools:recorder:{}", id);
    let _queue = ch
        .queue_declare(
            queue_name.as_str(),
            QueueDeclareOptions {
                exclusive: true,
                ..QueueDeclareOptions::default()
            },
            FieldTable::default(),
        )
        .await?;
    declared_queues.0.lock().await.insert(queue_name.clone());

    let _ = ch
        .queue_bind(
            &queue_name,
            exchange.as_str(),
            routing_key.as_str(),
            QueueBindOptions::default(),
            FieldTable::default(),
        )
        .await?;
    let consumer = ch
        .basic_consume(
            &queue_name,
            &queue_name,
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;
    let ch = ch.clone();
    consumer.set_delegate(move |delivery: DeliveryResult| {
        let app = app.clone();
        let channel = ch.clone();
        let id = id.clone();

        async move {
            if let Ok(Some(delivery)) = delivery {
                let result = json!({ "id": id, "payload": from_utf8(&delivery.data).unwrap() });
                println!("message");
                let _ = app.emit_all("amqp:message", result);
                delivery
                    .ack(BasicAckOptions::default())
                    .await
                    .expect("basic_ack");
                channel
                    .basic_cancel("my_consumer", BasicCancelOptions::default())
                    .await
                    .expect("basic_cancel");
            }
        }
    });
    Ok(())
}

#[tauri::command]
async fn amqp_stop_consuming(
    amqp_channel: State<'_, AmqpChannel>,
    declared_queues: State<'_, AmqpQueues>,
    id: String,
) -> Result<(), Error> {
    let channel_guard = amqp_channel.0.lock().await;
    let ch = channel_guard.as_ref().unwrap();
    let queue_name = format!("amqp-dev-tools:recorder:{}", id);
    declared_queues.0.lock().await.remove(queue_name.as_str());
    let _ = ch
        .queue_delete(&queue_name, QueueDeleteOptions::default())
        .await?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AmqpConnection(Default::default()))
        .manage(AmqpChannel(Default::default()))
        .manage(AmqpQueues(Default::default()))
        .invoke_handler(tauri::generate_handler![
            amqp_connect,
            amqp_disconnect,
            amqp_declare_exchange,
            amqp_publish,
            amqp_consume,
            amqp_stop_consuming
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

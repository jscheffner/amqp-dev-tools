import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export type AmqpMessage = {
  body: string
}

export function useRecorder(id: string) {
  const [amqpMessages, setAmqpMessages] = useState<AmqpMessage[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const startRecording = async (exchange: string, routingKey?: string) => {
    await invoke('amqp_consume', { id, exchange, routingKey })
    setIsRecording(true)
  }

  const stopRecording = async () => {
    await invoke('amqp_stop_consuming', { id })
    setIsRecording(false)
  }

  useEffect(() => {
    const unlisten = listen('amqp:disconnected', () => {
      setIsRecording(false)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  useEffect(() => {
    const unlisten = listen('amqp:message', ({ payload }) => {
      const e = payload as any
      if (e.id === id) {
        setAmqpMessages((messages) => [...messages, { body: e.payload }])
      }
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  return {
    messages: amqpMessages,
    isRecording,
    startRecording,
    stopRecording,
  }
}

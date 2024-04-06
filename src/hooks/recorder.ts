import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { toResult } from '@/lib/utils'

export type AmqpMessage = {
  body: string
}

export function useRecorder(id: string) {
  const [amqpMessages, setAmqpMessages] = useState<AmqpMessage[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const startRecording = async (exchange: string, routingKey?: string) => {
    const res = await toResult(
      invoke('amqp_consume', { id, exchange, routingKey }),
    )
    if (res.ok) {
      setIsRecording(true)
    }
    return res
  }

  const stopRecording = async () => {
    const res = await toResult(invoke('amqp_stop_consuming', { id }))
    if (res.ok) {
      setIsRecording(false)
    }
    return res
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

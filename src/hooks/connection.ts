import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export function useConnection(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>()

  const connect = async () => {
    setIsLoading(true)
    try {
      await invoke('amqp_connect', { connectionString: url })
      setError(undefined)
      setIsConnected(true)
      return { ok: true }
    } catch (err) {
      setError(err)
      return { ok: false, err }
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsLoading(true)
    return invoke('amqp_disconnect')
  }

  useEffect(() => {
    const unlisten = listen('amqp:disconnected', ({ payload }) => {
      if (payload != null) {
        console.log({ err: payload })
        setError(payload ?? 'Unexpected Error')
      } else {
        setError(undefined)
      }
      setIsLoading(false)
      setIsConnected(false)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  return {
    error,
    isConnected,
    isLoading,
    connect,
    disconnect,
  }
}

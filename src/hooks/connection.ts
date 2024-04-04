import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

const LOCAL_STORAGE_KEY = 'connection-string'

export function useConnection(defaultConnectionString: string) {
  const storedConnectionString = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  const [connectionString, setConnectionString] = useState(
    storedConnectionString ?? defaultConnectionString,
  )
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>()

  const connect = async () => {
    setIsLoading(true)
    try {
      await invoke('amqp_connect', { connectionString })
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
    window.localStorage.setItem(LOCAL_STORAGE_KEY, connectionString)
  }, [connectionString])

  useEffect(() => {
    const unlisten = listen('amqp:disconnected', ({ payload }) => {
      if (payload != null) {
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
    connectionString,
    isConnected,
    isLoading,
    connect,
    disconnect,
    setConnectionString,
  }
}

import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { toResult } from '@/lib/utils'

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
    const res = await toResult(invoke('amqp_connect', { connectionString }))
    setIsLoading(false)
    setError(res.err)
    if (res.ok) {
      setIsConnected(true)
    }
    return res
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

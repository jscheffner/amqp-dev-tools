import { Dispatch, useEffect } from 'react'
import { useConnection } from '@/hooks/connection'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ConnectionForm(props: {
  onConnectionChange: Dispatch<boolean>
}) {
  const {
    isConnected,
    isLoading,
    error,
    connectionString,
    setConnectionString,
    connect,
    disconnect,
  } = useConnection('amqp://127.0.0.1:5672')

  useEffect(() => {
    props.onConnectionChange(isConnected)
    if (!isConnected) {
      toast({
        title: 'Connection closed',
        description: error ? (error as string) : undefined,
        variant: error ? 'destructive' : undefined,
      })
    }
  }, [isConnected])

  const connectToAmqpServer = async () => {
    const { ok, err } = await connect()
    if (!ok) {
      toast({
        title: 'Could not connect!',
        description: err as string,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        disabled={isConnected || isLoading}
        value={connectionString}
        onChange={(e) => setConnectionString(e.target.value)}
        type="url"
        className="min-w-72"
        placeholder="AMQP connection string"
      />
      {isConnected ? (
        <Button disabled={isLoading} onClick={disconnect}>
          Disconnect
        </Button>
      ) : (
        <Button disabled={isLoading} onClick={connectToAmqpServer}>
          Connect
        </Button>
      )}
    </div>
  )
}

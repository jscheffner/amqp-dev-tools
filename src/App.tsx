import { Toaster } from './components/ui/toaster'
import { ConnectionForm } from './components/ConnectionForm'
import { CommandMenu } from './components/CommandMenu'
import { useState } from 'react'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  return (
    <div className="m-8">
      <ConnectionForm onConnectionChange={setIsConnected} />
      <CommandMenu isConnected={isConnected} />
      <Toaster />
    </div>
  )
}

export default App

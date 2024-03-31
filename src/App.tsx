import { Toaster } from './components/ui/toaster'
import { ConnectionForm } from './components/ConnectionForm'
import { CommandMenu } from './components/CommandMenu'
import { useState } from 'react'
import { Publisher } from './components/Publisher'

type PublisherDefinition = {
  type: 'publisher'
  id: string
}

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [devTools, setDevTools] = useState<PublisherDefinition[]>([])

  function addDevTool() {
    setDevTools([...devTools, { type: 'publisher', id: Date.now().toString() }])
  }

  return (
    <div className="m-8">
      <ConnectionForm onConnectionChange={setIsConnected} />
      <CommandMenu isConnected={isConnected} onAddDevTool={addDevTool} />
      <div className="flex flex-wrap py-8 gap-8">
        {devTools.map(({ id }) => (
          <Publisher
            disabled={!isConnected}
            onDelete={() => setDevTools(devTools.filter((t) => t.id !== id))}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export default App

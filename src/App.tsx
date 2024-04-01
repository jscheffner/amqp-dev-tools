import { Toaster } from './components/ui/toaster'
import { ConnectionForm } from './components/ConnectionForm'
import { CommandMenu } from './components/CommandMenu'
import { useState } from 'react'
import { Publisher } from './components/Publisher'
import { Recorder } from './components/Recorder'

type PublisherDefinition = {
  type: 'publisher'
  id: string
}

type RecorderDefinition = {
  type: 'recorder'
  id: string
}

type DevToolDefinition = PublisherDefinition | RecorderDefinition

export type DevToolType = DevToolDefinition['type']

function DevTool(props: {
  definition: DevToolDefinition
  isConnected: boolean
  onDelete: (id: string) => void
}) {
  switch (props.definition.type) {
    case 'publisher':
      return (
        <Publisher
          disabled={!props.isConnected}
          onDelete={() => props.onDelete(props.definition.id)}
        />
      )
    case 'recorder':
      return (
        <Recorder
          disabled={!props.isConnected}
          onDelete={() => props.onDelete(props.definition.id)}
          id={props.definition.id}
        />
      )
  }
}

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [devTools, setDevTools] = useState<DevToolDefinition[]>([])

  function addDevTool(type: DevToolType) {
    setDevTools([...devTools, { type, id: Date.now().toString() }])
  }

  return (
    <div className="m-8">
      <ConnectionForm onConnectionChange={setIsConnected} />
      <CommandMenu isConnected={isConnected} onAddDevTool={addDevTool} />
      <div className="flex flex-wrap py-8 gap-8">
        {devTools.map((definition) => (
          <DevTool
            key={definition.id}
            definition={definition}
            isConnected={isConnected}
            onDelete={(id) => setDevTools(devTools.filter((t) => t.id !== id))}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export default App

import { Toaster } from './components/ui/toaster'
import { ConnectionForm } from './components/ConnectionForm'
import { CommandMenu } from './components/CommandMenu'
import { useState } from 'react'
import { Publisher } from './components/Publisher'
import { Recorder } from './components/Recorder'
import { type DevToolDefinition, useDevTools } from './hooks/dev-tools'

function DevTool(props: {
  definition: DevToolDefinition
  isConnected: boolean
  onDelete: (id: string) => void
  onUpdate: (data: DevToolDefinition) => void
}) {
  switch (props.definition.type) {
    case 'publisher':
      return (
        <Publisher
          definition={props.definition}
          onUpdate={props.onUpdate}
          disabled={!props.isConnected}
          onDelete={() => props.onDelete(props.definition.id)}
        />
      )
    case 'recorder':
      return (
        <Recorder
          disabled={!props.isConnected}
          definition={props.definition}
          onUpdate={props.onUpdate}
          onDelete={() => props.onDelete(props.definition.id)}
          id={props.definition.id}
        />
      )
  }
}

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const { devTools, addDevTool, removeDevTool, updateDevTool } = useDevTools()

  return (
    <div className="m-8">
      <ConnectionForm onConnectionChange={setIsConnected} />
      <CommandMenu
        isConnected={isConnected}
        onAddDevTool={(type) => addDevTool({ type })}
      />
      <div className="flex flex-wrap py-8 gap-8">
        {devTools.map((definition) => (
          <DevTool
            key={definition.id}
            definition={definition}
            onUpdate={updateDevTool}
            isConnected={isConnected}
            onDelete={(id) => removeDevTool(id)}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}

export default App

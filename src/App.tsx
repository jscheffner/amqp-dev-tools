import { Toaster } from './components/ui/toaster'
import { ConnectionForm } from './components/ConnectionForm'

function App() {
  return (
    <div className="m-8">
      <ConnectionForm />
      <Toaster />
    </div>
  )
}

export default App

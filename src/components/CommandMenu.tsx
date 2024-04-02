import { useEffect, useState } from 'react'
import { DeclareExchangeDialog } from './DeclareExchangeDialog'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { DevToolType } from '@/App'

export function CommandMenu(props: {
  isConnected: boolean
  onAddDevTool: (type: DevToolType) => void
}) {
  const [open, setOpen] = useState(false)
  const [isDeclareExchangeDialogOpen, setIsDeclareExchangeDialogOpen] =
    useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <DeclareExchangeDialog
        open={isDeclareExchangeDialogOpen}
        onOpenChange={setIsDeclareExchangeDialogOpen}
      />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Dev Tools">
            <CommandItem
              onSelect={() => {
                props.onAddDevTool('publisher')
                setOpen(false)
              }}
            >
              Add Publisher
            </CommandItem>
            <CommandItem
              onSelect={() => {
                props.onAddDevTool('recorder')
                setOpen(false)
              }}
            >
              Add Recorder
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="AMQP">
            <CommandItem
              disabled={!props.isConnected}
              onSelect={() => {
                setOpen(false)
                setIsDeclareExchangeDialogOpen(true)
              }}
            >
              Declare Exchange...
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

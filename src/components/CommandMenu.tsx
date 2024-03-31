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

export function CommandMenu(props: { isConnected: boolean }) {
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

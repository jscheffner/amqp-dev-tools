import { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import z from 'zod'
import { useToast } from './ui/use-toast'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoke } from '@tauri-apps/api/tauri'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const EXCHANGE_TYPES = ['Default', 'Direct', 'Fanout', 'Topic', 'Headers']

export function DeclareExchangeDialog(props: {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}) {
  const schema = z.object({
    name: z.string(),
    type: z.string(),
  })
  const { toast } = useToast()
  type FormData = z.infer<typeof schema>
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Declare Exchange</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async ({ name, type }) => {
                  try {
                    await invoke('amqp_declare_exchange', {
                      exchangeName: name,
                      exchangeType: type,
                    })
                    toast({
                      title: 'Exchange declared',
                      description: `Exchange "${name}" successfuly declared`,
                    })
                  } catch (err) {
                    toast({
                      title: 'Exchange could not be declared',
                      description: err as string,
                      variant: 'destructive',
                    })
                  }
                  props.onOpenChange(false)
                })}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="my-4">
                      <FormLabel>Name</FormLabel>
                      <FormControl autoCapitalize="off" autoCorrect="off">
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="my-4">
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXCHANGE_TYPES.map((type) => (
                            <SelectItem value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="my-4">
                  Declare
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

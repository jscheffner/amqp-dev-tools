import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { TrashIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { invoke } from '@tauri-apps/api/tauri'
import { type PublisherDefinition } from '@/hooks/dev-tools'
import { Dispatch } from 'react'

export function Publisher(props: {
  disabled: boolean
  onDelete: () => void
  definition: PublisherDefinition
  onUpdate: Dispatch<PublisherDefinition>
}) {
  const send = (exchangeName: string, routingKey: string, message: string) => {
    return invoke('amqp_publish', { message, exchangeName, routingKey })
  }

  const schema = z.object({
    exchange: z.string(),
    routingKey: z.string(),
    message: z.string(),
  })

  type FormData = z.infer<typeof schema>
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: props.definition,
  })

  form.watch(({ message, ...data }) => {
    props.onUpdate({ ...props.definition, ...data })
  })

  return (
    <Card className="w-[300px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            async ({ exchange, routingKey, message }) => {
              await send(exchange, routingKey, message)
              form.setValue('message', '')
            },
          )}
          className="m-4"
        >
          <div className="flex justify-between">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Publisher
            </h3>
            <Button variant="ghost" size="icon" onClick={props.onDelete}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name="exchange"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Exchange</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="routingKey"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Routing Key</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="my-4" disabled={props.disabled}>
            Publish
          </Button>
        </form>
      </Form>
    </Card>
  )
}

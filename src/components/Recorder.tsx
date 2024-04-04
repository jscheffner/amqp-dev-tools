import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRecorder } from '@/hooks/recorder'
import { Card } from './ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { RecordedMessages } from './RecordedMessages'
import { TrashIcon } from 'lucide-react'
import { RecorderDefinition } from '@/hooks/dev-tools'
import { Dispatch } from 'react'

export function Recorder(props: {
  disabled: boolean
  id: string
  definition: RecorderDefinition
  onUpdate: Dispatch<RecorderDefinition>
  onDelete: () => void
}) {
  const schema = z.object({
    exchange: z.string(),
    routingKey: z.string(),
  })
  type FormData = z.infer<typeof schema>
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: props.definition,
  })

  form.watch((data) => {
    props.onUpdate({ ...props.definition, ...data })
  })

  const { startRecording, stopRecording, messages, isRecording } = useRecorder(
    props.id,
  )

  return (
    <>
      <Card>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ exchange, routingKey }) =>
              startRecording(exchange, routingKey),
            )}
            className="m-4"
          >
            <div className="flex justify-between">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Recorder
              </h3>
              <Button
                disabled={isRecording}
                variant="ghost"
                size="icon"
                onClick={props.onDelete}
              >
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
            <div className="flex gap-4 items-center">
              {isRecording ? (
                <Button
                  type="button"
                  className="my-4"
                  disabled={props.disabled}
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="my-4"
                  disabled={props.disabled}
                >
                  Start Recording
                </Button>
              )}
              <RecordedMessages messages={messages} />
            </div>
          </form>
        </Form>
      </Card>
    </>
  )
}

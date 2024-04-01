import { CopyIcon, RegexIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { AmqpMessage } from '@/hooks/recorder'
import { useState } from 'react'
import { Input } from './ui/input'

function MessageCard(props: { message: { body: string } }) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const copy = async () => {
    navigator.clipboard.writeText(props.message.body)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 1500)
  }
  return (
    <Card
      className="p-4 flex place-content-between"
      onMouseLeave={() => setIsFocused(false)}
      onMouseEnter={() => setIsFocused(true)}
    >
      <div className="pt-1">{props.message.body}</div>
      <Button
        className={isFocused ? 'visible' : 'invisible'}
        variant="ghost"
        size="icon"
        onClick={copy}
      >
        {hasCopied ? <span>Copied</span> : <CopyIcon className="h-4" />}
      </Button>
    </Card>
  )
}

const REGEX_FLAGS = ['d', 'g', 'i', 'm', 's', 'u', 'v', 'y']

export function RecordedMessages(props: { messages: AmqpMessage[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [regex, setRegex] = useState('.*')
  const [regexFlags, setRegexFlags] = useState('i')
  const filteredMessages = props.messages.filter((msg) =>
    new RegExp(regex, regexFlags).test(msg.body),
  )

  return (
    <>
      <a href="#" onClick={() => setIsDialogOpen(true)}>
        {props.messages.length} messages
      </a>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-screen overflow-y-scroll">
          <DialogHeader className="p-2">
            <DialogTitle>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Messages
              </h3>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-2">
            {filteredMessages.map((msg) => (
              <MessageCard message={msg} />
            ))}
          </div>
          <hr />
          <div className="flex items-center gap-4 p-2">
            <RegexIcon />
            <Input
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
            ></Input>
            /
            <Input
              className="w-12"
              value={regexFlags}
              onChange={(e) =>
                setRegexFlags(
                  [...e.target.value]
                    .map((flag) => flag.toLowerCase())
                    .filter((flag) => REGEX_FLAGS.includes(flag))
                    .join(''),
                )
              }
            ></Input>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

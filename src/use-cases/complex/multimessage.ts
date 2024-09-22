import { ell } from "../init"
import { Message } from "../../ell/messages/types";

const chatBot = ell.complex('gpt-4o-mini')((messageHistory: Message[]) => {
  return [
    ell.system('You are a helpful assistant.'),
    ...messageHistory
  ]
})

const conversation = [
  ell.user("Hello, who are you?"),
  ell.assistant("I'm an AI assistant. How can I help you today?"),
  ell.user("Can you explain quantum computing?")
]

; (async () => {
  const [response] = await chatBot(conversation)
  console.log(response.text)
})()

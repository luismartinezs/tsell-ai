import { input } from "@inquirer/prompts";
import { ell } from "../init"
import { Message } from "../../ell/messages/types";

const chatBot = ell.complex('gpt-4o-mini')((messageHistory: Message[]) => {
  return [
    ell.system('You are a friendly chatbot. Engage in casual conversation.'),
    ...messageHistory
  ]
})

  ; (async () => {
    const history: Message[] = []

    while (true) {
      const message = await input({ message: 'User: ' })
      history.push(ell.user(message))
      const [response] = await chatBot(history)
      console.log(response.text)
      history.push(response)
    }
  })()
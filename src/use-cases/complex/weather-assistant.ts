import { ell } from "../init"
import { Message } from "../../ell/messages/types";
import { z } from "zod";

const locationSchema = z.object({
  location: z.string().describe('The full name of a city and country, e.g. San Francisco, CA, USA')
})

const getWeather = ell.tool(locationSchema, async function getWeather({ location }) {
  // call API here
  await new Promise(resolve => setTimeout(resolve, 500));
  return `The weather in ${location} is sunny.`
})

const weatherAssistant = ell.complex('gpt-4o-mini', {
  tools: [getWeather]
})((messageHistory: Message[]) => {
  return [
    ell.system('You are a weather assistant. Use the get_weather tool when needed.'),
    ...messageHistory
  ]
})

const conversation = [
  ell.user("What's the weather like in New York?"),
]

  ; (async () => {
    const [response] = await weatherAssistant(conversation)

    if (response.tool_calls) {
      const [toolResults] = await response.callToolsAndCollectAsMessage()

      const [finalResponse] = await weatherAssistant([
        ...conversation,
        response,
        toolResults
      ])

      console.log(finalResponse.text);
    }
  })()

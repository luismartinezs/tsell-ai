import { ell } from "../init"
import { z } from "zod";
import { ToolObj } from "../../ell/types";

const locationSchema = z.object({
  location: z.string().describe('The full name of a city and country, e.g. San Francisco, CA, USA')
})
const getWeather = ell.tool(locationSchema, async function getWeather({ location }) {
  // api call here
  await new Promise(resolve => setTimeout(resolve, 500));
  return `The weather in ${location} is sunny with a temperature of 75 degrees.`;
})

const travelPlanner = ell.complex('gpt-4o-mini', {
  tools: [ getWeather ] as Array<ToolObj>
})((destination: string) => {
  return [
    ell.system('You are a travel planner. You need to get the weather in the destination city to be able to create a plan depending on the weather.'),
    ell.user(`Plan a trip to ${destination}.`)
  ]
})

; (async () => {
  // can call the tool directly as a regular function
  const weather = await getWeather.call({ location: 'Hong Kong' })
  console.log(weather) // The weather in Hong Kong is sunny with a temperature of 75 degrees.
  const [plan] = await travelPlanner('Paris')
  if (plan.tool_calls) {
    const [toolResults] = await plan.callToolsAndCollectAsMessage()
    console.log(toolResults.text) // <tool_result>
    console.log(toolResults.tool_result.result); // The weather in Paris, France is sunny with a temperature of 75 degrees.
  }
})()

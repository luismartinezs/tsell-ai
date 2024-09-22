// PARALLEL TOOL EXECUTION
// NOt implemented

import { z } from "zod"
import { ell } from "../init"
import { Message } from "../../ell/messages/types"

const toolA = ell.tool(z.object({
  task: z.string().describe('The task to perform')
}), async function toolA({ task }) {
  return `Task A: ${task}`
})

const toolB = ell.tool(z.object({
  task: z.string().describe('The task to perform')
}), async function toolB({ task }) {
  return `Task B: ${task}`
})

const toolC = ell.tool(z.object({
  task: z.string().describe('The task to perform')
}), async function toolC({ task }) {
  return `Task C: ${task}`
})

const parallelAssistant = ell.complex('gpt-4o-mini', {
  tools: [toolA, toolB, toolC]
})((messageHistory: Message[]) => {
  return [
    ell.system('You can use multiple tools in parallel.'),
    ...messageHistory
  ]
})

  ; (async () => {
    const [response] = await parallelAssistant([ell.user("Perform tasks A, B, and C simultaneously.")])
    if (response.tool_calls) {
      const [toolResult] = await response.callToolsAndCollectAsMessage({
        // NOTE: these params don't do anything right now
        parallel: true, maxWorkers: 3
      })
      console.log(toolResult.tool_result.result)
    }
  })()
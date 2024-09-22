import { z } from "zod";
import { Message } from "../../ell/messages/types";
import { ell } from "../init";

const createClaimDraft = ell.tool(z.object({
  claim: z.object({
    description: z.string().describe('The description of the claim'),
    amount: z.number().describe('The amount of the claim in dollars'),
    date: z.string().describe('The date of the incident'),
    claimant: z.string().describe('The name of the person filing the claim'),
    policyNumber: z.string().optional().describe('The policy number, if available')
  })
}), async function createClaimDraft({ claim }) {
  const claimId = Math.random().toString(36).substr(2, 9);
  const formattedDate = new Date(claim.date).toISOString().split('T')[0];
  return `
Claim draft created:
Claim ID: ${claimId}
Claimant: ${claim.claimant}
Date of Incident: ${formattedDate}
Description: ${claim.description}
Amount: $${claim.amount.toFixed(2)}
Policy Number: ${claim.policyNumber || 'Not provided'}

Status: Pending approval
  `.trim();
})

// MULTISTEP TOOL USAGE
const insuranceClaimChatbot = ell.complex('gpt-4o-mini', {
  temperature: 0.1,
  tools: [createClaimDraft]
})((history: Message[]) => {
  return [
    ell.system('You are an insurance adjuster AI. You are given a dialogue with a user and have access to various tools to effectuate the insurance claim adjustment process. Ask questions until you have enough information to create a claim draft. Ensure you have the claimant\'s name, date of incident, description, and amount. Then use the createClaimDraft tool to create a draft and ask for approval.'),
    ...history
  ]
})

  ; (async () => {
    const history = []
    const userMessages = [
      "Hello, I'm a customer",
      'I broke my car',
      ' smashed by someone else, today, $5k',
      'My information: name is John Doe, policy number is 1234567890, date of incident is 2024-01-01. My car collided with a tree.',
      'please file it.'
    ]

    for (const userMsg of userMessages) {
      history.push(ell.user(userMsg))
      const [response] = await insuranceClaimChatbot(history)
      history.push(response)
      if (response.tool_calls) {
        const [nextMessage] = await response.callToolsAndCollectAsMessage()
        history.push(nextMessage)
        const [finalResponse] = await insuranceClaimChatbot(history)
        console.log(finalResponse.text)
      }
    }
  })()
import { CoerceContentBlock, ContentBlock, CreateMessage, Message, User, Assistant, System } from "./types";

export const coerceContentBlock: CoerceContentBlock = (input) => {
  if (typeof input === 'string') {
    return { text: input };
  }
  return input;
};

// REF https://docs.ell.so/core_concepts/tool_usage.html#multi-step-tool-usage
/**
This function executes all tool calls in a response and collects the results into a single message, which can then be easily added to the conversation history

example

const plan = (await travelPlanner('Paris'))[0]

if (plan.tool_calls) {
  const toolResults = plan.callToolsAndCollectAsMessage()
  // toolResults is a message that contains the response from the tool calls
}
 */
function callToolsAndCollectAsMessage(): Message {
  return
}

export const createMessage: CreateMessage = (role, content) => {
  let contentBlocks: ContentBlock[];

  if (Array.isArray(content)) {
    contentBlocks = content.map(coerceContentBlock);
  } else {
    contentBlocks = [coerceContentBlock(content)];
  }

  const text = contentBlocks
    .filter(block => block && typeof block.text === 'string')
    .map(block => block.text)
    .join('\n');

  const parsed = contentBlocks.filter(block => block?.parsed).map(block => block.parsed)

  return {
    role,
    content: contentBlocks,
    text,
    parsed: parsed.length === 0
      ? null
      : parsed.length === 1
        ? parsed[0]
        : parsed,
  };
};

export const user: User = (content) => {
  return createMessage('user', content) as ReturnType<User>;
};

export const assistant: Assistant = (content) => {
  return createMessage('assistant', content) as ReturnType<Assistant>;
};

export const system: System = (content) => {
  return createMessage('system', content) as ReturnType<System>;
};
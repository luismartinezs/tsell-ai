import { ContentBlock, Message, ToolCall } from "./types";
import { system, user } from ".";
import { ToolObj } from "../types";

// const validRoles = ['system', 'user', 'assistant'] as const;

export const contentBlockToLlmContent = (contentBlock: ContentBlock | ContentBlock[]) => {
  // console.log('contentBlockToLlmContent');
  // console.log(contentBlock);
  if (!contentBlock) {
    return null;
  }
  if (Array.isArray(contentBlock)) {
    if (contentBlock.length === 1) {
      return contentBlock[0].text;
    }
    return contentBlock.map(block => ({
      type: 'text' as const,
      text: block.text
    }));
  }
  return contentBlock.text;
}

export const messageToOpenaiFormat = (message: Message) => {
  // console.log('messageToOpenaiFormat');
  // console.log(message);
  const openAIMessage: Record<string, any> = {
    role: message.tool_result ? 'tool' : message.role,
    content: contentBlockToLlmContent(message.content)
  }
  if (message.tool_calls) {
    try {
      openAIMessage.tool_calls = message.tool_calls.map(toolCall => ({
        id: toolCall.tool_call_id,
        type: 'function',
        function: {
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.params)
        }
      }))
    } catch (e) {
      console.error('ERROR CONVERTING TOOL CALLS TO OPENAI FORMAT');
      console.error(e);
    }
  }
  if (message.tool_result) {
    // console.log('messageToOpenaiFormat TOOL RESULT');
    // console.log(message.tool_result);
    openAIMessage.tool_call_id = message.tool_result.tool_call_id
    openAIMessage.content = message.tool_result.result
  }
  return openAIMessage
}

export const messageToLlmMessage = (message: Message | Array<Message>) => {
  const isMany = Array.isArray(message);
  if (isMany) {
    return message.map((msg) => messageToOpenaiFormat(msg))
  }
  return [
    messageToOpenaiFormat(message)
  ]
}

export const createPromptMessages = (systemMessage, prompt) => {
  if (typeof prompt === 'string') {
    return [
      system(systemMessage),
      user(prompt)
    ]
  }
  let _systemMessage = systemMessage
  let _otherPrompts = prompt

  if (prompt[0].role === 'system') {
    _systemMessage = prompt[0].content
    _otherPrompts = prompt.slice(1)
  }

  return [
    system(_systemMessage),
    ..._otherPrompts
  ]
}

function getToolCall(llmToolCall): ToolCall {
  if (!llmToolCall) {
    return null
  }
  const { type, id, function: fnc } = llmToolCall
  return {
    tool: `<${type} ${fnc.name}>`,
    tool_call_id: id,
    params: JSON.parse(fnc.arguments),
    name: fnc.name
  }
}

function getText(llmMessage) {
  if (llmMessage.parsed) {
    return '<parsed>'
  }
  if (llmMessage.tool_calls && llmMessage.tool_calls.length > 0) {
    return llmMessage.tool_result
  }
  return llmMessage.content
}

function makeCallToolsAndCollectAsMessage(toolCalls, tools): () => Promise<Array<Message>> {
  // console.log('TOOL CALLS');
  // console.log(JSON.stringify(toolCalls, null, 2));
  // console.log('TOOLS');
  // console.log(JSON.stringify(tools, null, 2));

  if (!toolCalls || toolCalls.length === 0) {
    return null
  }

  return async () => {
    const results: Array<Message> = [];
    for (const toolCall of toolCalls) {
      const tool = tools.find(t => t.definition.function.name === toolCall.function.name);
      // console.log('TOOL');
      // console.log(JSON.stringify(tool, null, 2));

      const toolResult = await tool.call(toolCall.function.parsed_arguments);

      results.push({
        role: 'user',
        // content should contain something, again I think the whole message implementation is messed up
        content: [],
        text: '<tool_result>',
        parsed: null,
        tool_result: {
          tool_call_id: toolCall.id,
          result: toolResult
        },
        tool_calls: null
      });
    }
    return results;
  }
}

function getContent(content) {
  if (typeof content === 'string') {
    return [{ text: content }]
  }
  return content
}

function getMessage(llmMessage: Record<string, any>, tools: Array<ToolObj>) {
  const toolCalls = llmMessage.tool_calls && llmMessage.tool_calls.length > 0 ? llmMessage.tool_calls.map(getToolCall) : null

  const content = getContent(llmMessage.content)

  return {
    role: llmMessage.role,
    content: content,
    text: getText(llmMessage),
    parsed: llmMessage.parsed ?? null,
    tool_calls: toolCalls,
    callToolsAndCollectAsMessage: makeCallToolsAndCollectAsMessage(llmMessage.tool_calls, tools)
  }
}

type LlmResponse = {
  choices: Array<{
    message: Record<string, any>
  }>
} & Record<string, any>

export function llmResponseToMessage(response: LlmResponse, tools: Array<ToolObj>): Array<Message> {
  if (Array.isArray(response.choices)) {
    if (response.choices.length === 1) {
      const message = response.choices[0].message;
      return [getMessage(message, tools)];
    } else {
      return response.choices.map(choice => getMessage(choice.message, tools));
    }
  }
  return null;
}

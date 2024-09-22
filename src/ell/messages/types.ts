export type Content = Array<string>

type Schema = Record<string, any>

export type ToolCall ={
  tool: string // <function get_weather at 0x7e1cc39180d0>
  tool_call_id: string // 'call_kYbStLH6c546PNRh1JdABPnM'
  params: Record<string, any> // { location: 'Paris' }
  name: string // 'get_weather'
}

export type ToolResult = {
  tool_call_id: string
  result: Array<ContentBlock>
}

export type ContentBlock = {
  text?: string | null
  parsed?: Schema | null
  tool_calls?: ToolCall[] | null
  tool_result?: ToolResult | null
}

type CallToolsAndCollectAsMessageParams = {
  parallel?: boolean
  maxWorkers?: number
}
type MessageMethods = {
  callToolsAndCollectAsMessage?: (params?: CallToolsAndCollectAsMessageParams) => Promise<Array<Message>> | null
}

type ContentTypes = {
  text: string | null
  parsed: Schema | null
  tool_calls?: ToolCall[] | null
  tool_result?: ToolResult | null
}

// TODO messages should use getter syntax to avoid data duplication:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
export type Message = {
  role: string;
  content: Array<ContentBlock>
} & ContentTypes & MessageMethods


export type ContentParam = string | string[] | ContentBlock | ContentBlock[]
type CreateMessageParams = [string, ContentParam]
export type CreateMessage = (...params: CreateMessageParams) => Message

export type CoerceContentBlock = (input: string | ContentBlock) => ContentBlock

export type User = (content: ContentParam) => Omit<Message, 'role'> & { role: 'user' }
export type Assistant = (content: ContentParam) => Omit<Message, 'role'> & { role: 'assistant' }
export type System = (content: ContentParam) => Omit<Message, 'role'> & { role: 'system' }
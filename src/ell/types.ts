import { ZodObject, ZodRawShape } from "zod";
import { Assistant, Message, System, User } from "./messages/types";
import { tool } from "./lmp/tool";

export type Tool = typeof tool
export type ToolObj = ReturnType<Tool>

export { ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
export { Body } from "@/common/lib/openai";

export type CreateEllConfig = {
  store?: string;
}

export type EllConfig = CreateEllConfig & {
  // TODO add internal config types
}

export type LogFnc = (type: 'prompt' | 'response' | 'error', content: string) => void;

// simple

type LLMApiParams = {
  n?: number
  temperature?: number
  max_tokens?: number
} & Record<string, any>

type SimpleParams = {
  exemptFromTracking?: boolean // default false
  // client?: any | null // TODO
} & LLMApiParams

type Input = string|Message|Message[]
export type Prompt = string | Array<Message>

export type GeneratePrompt = (input: Input) => Prompt
export type SimpleLPMFn = GeneratePrompt
export type ExecutePrompt = (input: Input, runtimeParams?: LLMApiParams) => Promise<string | string[]>

export type CreateHandler = (generatePrompt: GeneratePrompt) => ExecutePrompt

export type Simple = (model: string, params?: SimpleParams) => CreateHandler

type CreateSimpleParams = {
  log: LogFnc
}
export type CreateSimple = (params: CreateSimpleParams) => Simple

// complex
export type Schema = ZodObject<ZodRawShape>
type ComplexParams = {
  response_format?: Schema
  tools?: Array<ToolObj>
} & SimpleParams

export type ComplexExecutePrompt = (input: Input, runtimeParams?: LLMApiParams) => Promise<Message[]>
export type ComplexCreateHandler = (generatePrompt: GeneratePrompt) => ComplexExecutePrompt

export type Complex = (model: string, params?: ComplexParams) => ComplexCreateHandler

type CreateComplexParams = CreateSimpleParams
export type CreateComplex = (params: CreateComplexParams) => Complex

// TOOL

export type Ell = {
  simple: Simple
  complex: Complex
  system: System
  user: User
  assistant: Assistant
  tool: Tool
}

export type CreateEll = (config?: CreateEllConfig) => Ell
import { Schema } from "../../types"
import { zodFunction } from "openai/helpers/zod";

const getToolDefinition = ({ schema, name, description }: { schema: Schema, name: string, description?: string }) => {
  const def = { name, parameters: schema }
  if (description) {
    // @ts-ignore typescript is hateful sometimes
    def.description = description
  }
  return zodFunction(def)
}

export const tool = <Fnc extends (...args: any[]) => Promise<any>>(schema: Schema, fnc: Fnc) => {
  // NOTE do not validate fnc args, assume they are correct
  // console.log('FNC_NAME', fnc.name);

  return {
    call: fnc,
    definition: getToolDefinition({ schema, name: fnc.name })
  }
}

export const parseTools = (apiOptions) => {
  if (apiOptions.tools) {
    return {...apiOptions, tools: apiOptions.tools.map(tool => tool.definition)}
  }
  return apiOptions
}
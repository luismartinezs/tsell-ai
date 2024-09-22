import { logger } from "../../debug";
import { complexChat } from "../../lib/openai";
import { system, user } from "../../messages";
import { Message } from "../../messages/types";
import { llmResponseToMessage, messageToLlmMessage } from "../../messages/utils";
import { Complex, ComplexCreateHandler, ComplexExecutePrompt, CreateComplex, GeneratePrompt } from "../../types";
import { logMessages, versionedPrompt } from "../../utils";

export const createComplex: CreateComplex = ({ log }) => {
  const complex: Complex = (model, params = {}) => {
    const createHandler: ComplexCreateHandler = (generatePrompt: GeneratePrompt) => {
      const executePrompt: ComplexExecutePrompt = async (input, runtimeParams = {}) => {
        const versionedPromptFn = await versionedPrompt(generatePrompt.name, generatePrompt);
        const prompt = await versionedPromptFn(input);

        const { defaultSystemMessage = 'You are a helpful assistant.', exemptFromTracking = false, ...apiOptions } = {
          ...params,
          ...runtimeParams
        };

        logger('PROMPT');
        logger(JSON.stringify(prompt, null, 2));

        const isStringInput = typeof prompt === 'string'

        let messages: Array<Message> = []

        if (isStringInput) {
          messages = [system(defaultSystemMessage), user(prompt)]
        } else {
          const hasSystemMessage = prompt[0].role === 'system'
          messages = hasSystemMessage ? prompt : [system(defaultSystemMessage), ...prompt]
        }

        logger('MESSAGES');
        logger(JSON.stringify(messages, null, 2));

        const llmMessages = messageToLlmMessage(messages);

        logger('LLM MESSAGES');
        logger(JSON.stringify(llmMessages, null, 2));

        if (!exemptFromTracking) {
          log('prompt', logMessages(llmMessages as any));
        }

        const tools = apiOptions.tools
        const toolDefinitions = tools ? tools.map(tool => tool.definition) : null

        // logger('TOOL DEFINITIONS');
        // logger(JSON.stringify(toolDefinitions, null, 2));
        // logger('TOOLS');
        // logger(JSON.stringify(tools, null, 2));

        // logger('TEST CALL');
        // const testCall = await tools[0].call({location: 'London'})
        // logger(JSON.stringify(testCall, null, 2));

        const llmPayload: Record<string, any> = {
          model,
          messages: llmMessages,
          ...apiOptions,
        }

        if (toolDefinitions) {
          llmPayload.tools = toolDefinitions
        }

        logger('LLM PAYLOAD');
        logger(JSON.stringify(llmPayload, null, 2));

        try {
          const res = await complexChat(llmPayload);

          logger('LLM RESPONSE');
          logger(JSON.stringify(res, null, 2));


          const response = res.choices.map(choice => choice.message)

          if (!exemptFromTracking) {
            log('response', logMessages(response));
          }

          // NOTE: because setting up typescript right is overcomplicated and takes too much time, we are always returning an array of messages by default, even with n = 1

          const messages = llmResponseToMessage(res, tools)

          logger('RESPONSEMESSAGES');
          logger(JSON.stringify(messages, null, 2));

          if ('n' in apiOptions && apiOptions.n > 1) {
            return messages;
          }

          return messages;
        } catch (error) {
          console.error('Error calling OpenAI API:', error);
          if (!exemptFromTracking) {
            log('error', error instanceof Error ? error.message : String(error));
          }
          throw error;
        }
      }

      return executePrompt
    }

    return createHandler
  }
  return complex
}
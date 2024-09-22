import { logMessages, versionedPrompt } from '../../utils';
import { CreateHandler, CreateSimple, ExecutePrompt, GeneratePrompt, Simple } from '../../types';
import { simpleChat } from "../../lib/openai";
import { createPromptMessages, messageToLlmMessage } from '../../messages/utils';
// import invariant from 'tiny-invariant'
import { logger } from '../../debug';

// LMP function: produce a string or list of messages to be sent to a LLM

// FLOW
// createSimple: (params) => ell
// ell.simple: (model, params) => createHandlerFunction
// createHandlerFunction: (generatePrompt) => executePrompt
// generatePrompt: (input) => prompt --string or message[]--
// executePrompt: async (input) => LLMresponse
// LLMresponse: string | string[]

function invariant(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertions(options) {
  logger(options.tools)
  invariant(!options.tools, 'tools are not supported in simple mode')
  invariant(!options.tool_choice, 'tool_choice is not supported in simple mode')
  invariant(!options.response_format, 'response_format is not supported in simple mode')
}

export const createSimple: CreateSimple =
  ({ log }) => {

    const simple: Simple = (model, params = {}) => {
      assertions(params)
      const createHandler: CreateHandler = (generatePrompt: GeneratePrompt) => {
        const executePrompt: ExecutePrompt = async (input, runtimeParams = {}) => {
          assertions(runtimeParams)
          const versionedPromptFn = await versionedPrompt(generatePrompt.name, generatePrompt);

          // console.log(input);

          const prompt = await versionedPromptFn(input);

          // console.log('PROMPT OR MESSAGES');
          // console.log(JSON.stringify(prompt, null, 2));

          // GET PROMPT
          // const prompt = generatePrompt(versionedInput)

          // GET SYSTEM MESSAGE (and other options)
          const { defaultSystemMessage = 'You are a helpful assistant.', exemptFromTracking = false, ...apiOptions } = {
            ...params,
            ...runtimeParams
          };

          // GET MESSAGES
          const messages = createPromptMessages(defaultSystemMessage, prompt)

          // console.log('MESSAGES');
          // console.log(JSON.stringify(messages, null, 2));



          const llmMessages = messageToLlmMessage(messages);

          // console.log('LLM MESSAGES');
          // console.log(JSON.stringify(llmMessages, null, 2));

          if (!exemptFromTracking) {
            log('prompt', logMessages(llmMessages));
          }

          try {
            const res = await simpleChat({
              model,
              messages: llmMessages,
              ...apiOptions,
            });

            // console.log('RESPONSE');
            // console.log(JSON.stringify(res, null, 2));


            const response = res.choices.map(choice => choice.message)

            // console.log(JSON.stringify(response, null, 2));


            if (!exemptFromTracking) {
              log('response', logMessages(response));
            }

            if ('n' in apiOptions && apiOptions.n > 1) {
              return response.map(msg => msg.content);
            }

            return response[0].content;
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

    return simple
  }

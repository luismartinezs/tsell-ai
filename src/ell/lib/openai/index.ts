import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { logger } from "../../debug";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const defaultBody = {
  model: "gpt-4o-mini",
  stream: false
} as const;


const defaultOptions = {} as const

export const simpleChat = async (...params) => {
  const [body, options] = params;
  const _body = { ...defaultBody, ...body };
  const _options = { ...defaultOptions, ...options };

  const res = await openai.chat.completions.create(_body, _options)

  return res
}

const chatWithSchema = async (...params) => {
  const [body, options] = params;
  const _body = { ...defaultBody, ...body };
  const _options = { ...defaultOptions, ...options };

  if (_body.response_format) {
    _body.response_format = zodResponseFormat(_body.response_format, "response")
  }

  logger('chatWithSchema BODY');
  logger(JSON.stringify(_body, null, 2));
  logger('chatWithSchema OPTIONS');
  logger(JSON.stringify(_options, null, 2));

  try {
    const res = await openai.beta.chat.completions.parse(_body, _options)
    return res
  } catch (e) {
    console.error(e);
    throw e
  }
}

export const complexChat = chatWithSchema

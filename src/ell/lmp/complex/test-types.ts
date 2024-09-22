import { z } from "zod";

// Mock implementations for demonstration purposes
const processPayload = (payload: any) => payload;
const mockLlmCall = async (payload: any) => {
  // Mock response generation based on `n`
  const choices = Array(payload.n || 1)
    .fill(0)
    .map(() => ({
      message: {
        content: `Response to: ${payload.prompt}`,
      },
    }));
  return { choices };
};

interface LlmApiPayload {
  n?: number;
  prompt: string;
  response_format?: z.ZodType<any>;
}

interface Message {
  content: string;
  parsed?: Record<string, any>;
}

const mockLlmApi = async (
  payload: LlmApiPayload
): Promise<{ choices: Array<{ message: Message }> }> => {
  const llmPayload = processPayload(payload);
  const res = await mockLlmCall(llmPayload);
  return res;
};

type Options = {
  n?: number;
  response_format?: z.ZodType<any>;
};

type GeneratePrompt<T> = (input: T) => string;

type MessageType<RF extends z.ZodType<any> | undefined> = RF extends z.ZodType<any>
  ? Message & { parsed: z.infer<RF> }
  : Message;

type ReturnTypeForN<
  N extends number,
  RF extends z.ZodType<any> | undefined
> = N extends 1 ? MessageType<RF> : Array<MessageType<RF>>;

function complex<T, N extends number = 1, RF extends z.ZodType<any> | undefined = undefined>(
  options: { n?: N; response_format?: RF } = {}
) {
  const createHandler = (generatePrompt: GeneratePrompt<T>) => {
    const executePrompt = async (
      input: T,
      runtimeParams: { n?: number; response_format?: z.ZodType<any> } = {}
    ): Promise<any> => {
      const prompt = generatePrompt(input);
      const apiOptions = { ...options, ...runtimeParams };

      const res = await mockLlmApi({ ...apiOptions, prompt });

      const messages = res.choices.map((choice) => choice.message);

      const responseFormat = apiOptions.response_format;

      if (responseFormat) {
        messages.forEach((msg) => {
          msg.parsed = responseFormat.parse(msg.content);
        });
      }

      if (apiOptions.n && apiOptions.n > 1) {
        return messages as ReturnTypeForN<typeof apiOptions.n, RF>;
      } else {
        return messages[0] as ReturnTypeForN<1, RF>;
      }
    };
    return executePrompt;
  };
  return createHandler;
}

const test = async () => {
  // avoid changing any code below
  // based on the value of n, the return type should be inferred to be an array or a single message
  const hello = complex({ n: 1 })(input => `Hello ${input}`)
  const aa = await hello('world')
  console.log(aa.content)
  const bb = await hello('world', { n: 2 })
  console.log(bb[0].content);
  // if the response format is passed, that means that the response is coerced to be of the defined shape, and the return type should be inferred to be of the defined shape
  const review = complex({
    n: 1, response_format: z.object({
      title: z.string(),
      description: z.string(),
      rating: z.number()
    })
  })(movie => `Provide a review for the movie ${movie}`)
  const cc = await review('star wars')
  console.log(cc.parsed.title)
  console.log(cc.parsed.description)
  console.log(cc.parsed.rating)
}

test();
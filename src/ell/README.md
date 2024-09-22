this is an attempt to rewrite some of the features described in https://docs.ell.so/ in node / typescript

Ell overview:

[ ] = not started
[P] = planned
[.] = wip
[D] = delayed
[x] = done
[A] = done but it's a basic / simplified version

Glossary:

- LMP = Language Model Program

- [x] ell.simple: returns simple prompt functions that return strings
  - [P] multiple prompts (n>1) return array of strings
  - [D] multimodality
    - [D] ell.user takes array of strings and images
      - [D] an image is in a given format, e.g. PIL image
        - [D] in node I can use sharp
        - [D] whatever image input, the output should be compatible with the openai vision API
  - [P] text only outputs
  - [P] prompt function returns string or array of Messages
  - [x] API
    - [x] model
    - [D] client?: openai client instance
    - [D] exempt_from_tracking = false
    - [x] api_params (ai API payload)
      - [x] can be passed in simple fnc or in prompt fnc
- [D] versioning: saving different drafts or versions of a prompt or workflow, e.g. run two different prompts and compare results
  - [D] checkpoint: like a snapshot of prompting. It allows to continue from that point. Like a save game
  - [D] autocommiting: autogenerate commit message with gpt-4o-mini every time a new version of the prompt is made
- [D] tracing: keep track of inputs, outputs and metadata on how they were formed, a dependency graph. It shows the entire interaction between prompts and basically keeps track of the entire workflow
  - [ ] track how prompts are formed (trace)
- [D] Studio: UI to visualize LMP, versioning, tracing, etc
- [ ] Messages: unit of interaction with LLMs. Ell Messages are not the same as OpenAI API Messages
  - [ ] Message API: reliest on inference of the different content types to off-load work from dev and programmatically create the right Messages
    - [ ] Message
      - [.] role: str
      - [.] content: Array<ContentBlock> | ContentBlock
      - [ ] returns a message format compatible with the openai API
    - [ ] ContentBlock fields (see `ell/messages/types.ts`):
      - [ ] audio: Float32Array | number[] | null
      - [ ] image: Buffer | string | Uint8Array | null
      - [ ] image_detail: string | null
      - [ ] parsed: <T> = T | null;
      - [.] text: string | null
      - [ ] tool_call: { toolName: string; parameters: Record<string, any> } (ToolCall) | null
      - [ ] tool_result: { result: any; success: boolean } (ToolResult) | null
    - [ ] common roles: user, system, assistant fncs take a string or an array of ContentBlock to return a Message
    - [ ] Message object return value (from ell.complex)
      - [ ] text: str (replaces non text by indicators, e,g. `<image>`)
      - [ ] text_only: str
      - [ ] tool_calls: Array<ToolCall>
      - [ ] tool_results: Array<ToolResult>
      - [ ] parsed: ParsedType<T> | Array<ParsedType<T>>
      - [ ] images: Array<Image>
      - [ ] audios: Array<Audio>
- [ ] ell.complex: multimodality, structured data, tool usage
  - [ ] returns "Messages"
  - [ ] usage: extends ell.simple
  - [ ] can handle multimodal inputs AND outputs (https://docs.ell.so/core_concepts/ell_complex.html#multimodal-interactions)
    - [ ] great example: https://docs.ell.so/core_concepts/multimodality.html#the-power-of-multimodal-composition
  - [ ] chat / convo history: useful to keep appending convo history to the next prompt (https://docs.ell.so/core_concepts/ell_complex.html#chat-based-use-cases)
  - [ ] API
    - [ ] *model
    - [ ] response_format (zod schema, JSON or similar)
      - [ ] response will have parsed prop with response_format shape
    - [ ] *api_params (ai API payload)
    - [ ] tools: Array<Callable>
    - [ ] *client
    - [ ] *exempt_from_tracking
    - [ ] post_callback: Callable = optional function to process LLM output before returning
    - [ ] ...other
- [ ] Tool usage (early alpha)
  - [ ] ell.tool: returns Callable
    - [ ] transforms regular function into a tool that can be used in LLM
    - [ ] it autogenerates tool schema from the function signature
    - [ ] need to pass the tool to ell.complex to make it available to the LLM
  - [ ] single step tool usage
  - [ ] multi step tool usage
    - [D] call_tools_and_collect_as_message
      - [D] allows parallel tool calling, i.e. parallel=True, max_workers=3
  - [D] eager mode: complex LLM tools calling with open ended tool call (future)
- [ ] structured output
  - [ ] a schema library or generator that is flexible, e.g. should have utilities to generate JSON schema and validate unparsed JSON
- [D] Model registration
  - [D] out of the box: OpenAI, Anthropic, Groq, Cohere
  - [D] if no client is found, fallback is OpenAI
  - [D] ell.config.register_model
  - [D] ell.simple({client})
- [ ] Config
  - [ ] ell.init (createEll) = thin wrapper around ell.config
    - [ ] verbose = false
    - [ ] store: str | null = null
    - [ ] autocommit = true
    - [ ] lazy_versioning = true
    - [ ] default_lm_params: Record<string, any> | null = null
    - [ ] default_openai_client: OpenAI | null = null
  - [ ] ell.config = stores global config

Missing
- proper store and autocommit: https://docs.ell.so/core_concepts/versioning_and_storage.html
  - there is a versioning feature that logs prompt versions and invocations to a JSON file, it should eventually be udpated to a sqlite DB
- Images, and multimodal inputs https://docs.ell.so/core_concepts/message_api.html#challenges-with-llm-apis
  - i do not fully understand how the library works and it is not my use case, so leaving for later
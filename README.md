# TSELL

Read as "Cell"

Tsell is a lightweight typescript library for building LLM workflows

It is ported from the pythong library https://github.com/MadcowD/ell and heavily inspired by it, because I don't know python and I want to easily create LLM workflows

It is something I quickly put together in about 3 days. As such, it is dirty code that **just** does the bare minimum that is supposed to do.

DO NOT USE THIS FOR ANYTHING IMPORTANT

CALL FOR HELP! OPEN TO CRITIZISMS AND SUGGESTIONS!

## Install

This is not yet published, so how can you play around with it?

1. Clone the repo
2. `pnpm install`
3. Add code in a new file witin the repo. Use the `use-cases` folder as an example
4. Run the file with `pnpm ts path-to-file.ts`


```bash
# Not yet published as a package so this doesn't work yet!
pnpm add tsell-ai
```

## Basic usage

### Initialization

```ts
import { createEll } from "tsell-ai";
export const ell = createEll({ store: 'src/logs' })
```

The library has two main functions:

## `ell.simple`

For simple use cases, i.e. no tool calling, no structured outputs

```ts
// Hello world
const hello = ell.simple('gpt-4o-mini')((name: string) => {
  return `Say hello to ${name}`
})

; (async () => {
  const result = await hello('Bruce Wayne')
  console.log(result)
  // Hello, Bruce Wayne! How's it going? Ready to save Gotham again?
})()
```

## `ell.complex`

For cases where you need tool calling and / or structured outputs

### Structured outputs

```ts
import { z } from "zod"
import { ell } from "../init"

const movieReviewSchema = z.object({
  title: z.string().describe('The title of the movie'),
  rating: z.number().describe('The rating of the movie out of 10'),
  summary: z.string().describe('A brief summary of the movie'),
})

const generateMovieReview = ell.complex('gpt-4o-mini', {
  response_format: movieReviewSchema,
  max_tokens: 500
})((movie) => {
  return [
    ell.system(`You are a movie review generator. Given the name of a movie, you need to return a structured review.`),
    ell.user(`Generate a review for the movie ${movie}.`)
  ]
})

; (async () => {
  const [review] = await generateMovieReview('The Matrix')
  console.log(review.parsed)
})()
```

## Tool calling

```ts
import { ell } from "../init"
import { z } from "zod"


const personSchema = z.object({
  name: z.string().describe('The name of the person'),
  age: z.number().describe('The age of the person'),
})

const extractPersonInfo = ell.complex('gpt-4o-mini', {
  response_format: personSchema
})((text: string) => {
  return [
    ell.system('Extract person information from the given text.'),
    ell.user(text)
  ]
})

;(async () => {
  const text = 'John Doe is 30 years old and works as a software engineer.'
  const [response] = await extractPersonInfo(text)
  const personInfo = response.parsed
  console.log(`
Name: ${personInfo.name}
Age: ${personInfo.age}
`)
})()

```

See more usage examples in the [use-cases](./use-cases) folder

## Missing features

- Versioning and tracing (there is a crappy quick and dirty implementation of logging and versioning)
- Multimodality (image, audio, etc)

## Dev notes / call for help

The typescript types are messy and there is at least one thing that begs for a rewrite, the messages types have data duplication that needs to be replaced by getters. It's the first time I've tried to create a library like this and I realized I'm far from a typescript expert.

I realize I need to reuse the ell.simple implementation within the ell.complex one as "simple" is one narrow use case of "complex", but I didn't get to that yet

I call for anyone to play around with the library and help improve it. Suggestions and criticism are **very** welcome.
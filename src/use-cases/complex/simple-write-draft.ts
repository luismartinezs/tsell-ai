import { ell } from "../init";

// NOTE: if max_tokens is too low, openai will throw

const writeDraft = ell.complex('gpt-4o-mini', { max_tokens: 2000 })(idea => {
  return [
    ell.system(`You are an adept story writer. The story should only be 3 paragraphs.`),
    ell.user(`Write a story about ${idea}.`)
  ]
})

  ; (async () => {
    const [result] = await writeDraft('an extraterrestrial race arrives to earth and wants to bet the fate on humanity in a wrestling match', { max_tokens: 600 })
    console.log(result.text)
  })()
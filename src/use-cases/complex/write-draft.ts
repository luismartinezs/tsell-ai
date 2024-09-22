import { ell } from "../init"

const writeDraft = ell.complex('gpt-4o-mini', { max_tokens: 600 })(idea => {
  return [
    ell.system(`You are an adept story writer. The story should only be 3 paragraphs.`),
    ell.user(`Write a story about ${idea}.`)
  ]
})

;(async () => {
  const [draft] = await writeDraft('A story about a cat')
  console.log(draft.text)
})()
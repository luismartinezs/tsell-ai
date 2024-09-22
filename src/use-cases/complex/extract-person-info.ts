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

  ; (async () => {
    const text = 'John Doe is 30 years old and works as a software engineer.'
    const [response] = await extractPersonInfo(text)
    const personInfo = response.parsed
    console.log(`
  Name: ${personInfo.name}
  Age: ${personInfo.age}
  `)
  })()
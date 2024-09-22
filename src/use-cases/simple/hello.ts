import { ell } from "../init";
const hello = ell.simple('gpt-4o-mini')((name: string) => {
  return `Say hello to ${name}`
})

; (async () => {
  const result = await hello('Bruce Wayne')
  console.log(result)
  // Hello, Bruce Wayne! How's it going? Ready to save Gotham again?
})()
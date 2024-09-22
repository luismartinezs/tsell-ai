import { ell } from "../init";

const hello = ell.complex('gpt-4o-mini')((name: string) => {
  return `Say hello to ${name}`
})

; (async () => {
  const [result] = await hello('John Attenborough')
  console.log(result.text)
})()
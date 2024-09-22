import { ell } from "../init";

const writeDraft = ell.simple('gpt-4o-mini', { max_tokens: 600 })(idea => {
  return [
    ell.system(`You are an adept story writer. The story should only be 3 paragraphs.`),
    ell.user(`Write a story about ${idea}.`)
  ]
})

  ; (async () => {
    const result = await writeDraft('an extraterrestrial race arrives to earth and wants to bet the fate on humanity in a wrestling match', { max_tokens: 100 })
    console.log(result)
    // In a serene evening sky, a bright light suddenly flickered into existence, erupting into a brilliant glow as it descended towards Earth. From the ship emerged the Xelthorians, a towering extraterrestrial race known for their unmatched strength and guile. They communicated through a series of melodic hums and fluttering visuals, announcing their intention: to challenge humanity to a wrestling match to determine the fate of Earth and its inhabitants. The world watched in disbelief as the news spread, politicians and scientists
  })()
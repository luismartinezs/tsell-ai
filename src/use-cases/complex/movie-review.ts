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
    // {
    //   title: 'The Matrix',
    //   rating: 9,
    //   summary: "The Matrix, directed by the Wachowskis, is a groundbreaking sci-fi action film that explores the nature of reality through the lens of a dystopian future where humanity is unknowingly trapped inside a simulated reality created by sentient machines. The film follows the journey of Thomas Anderson, a computer programmer who discovers his true identity as Neo, the prophesied 'One' who can manipulate the Matrix. With stunning visual effects, thought-provoking themes, and a compelling narrative, The Matrix has become a cultural landmark that redefined the genre and continues to inspire discussions about technology and consciousness."
    // }
  })()
import { getRelevantProducts } from "../services/productService.js"
import { generateAIReply } from "../services/aiService.js"

export const chatHandler = async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message cannot be empty"
      })
    }

    const products = await getRelevantProducts(message)

    const reply = await generateAIReply({
      message,
      products,
      history
    })

    return res.json({ reply })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: "AI failed. Please try again."
    })
  }
}

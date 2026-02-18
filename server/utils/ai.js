import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askAI = async (message, products = []) => {
  try {

    let productInfo = "No matching products found.";

    if (products.length > 0) {
      productInfo = products.map(p => `
Title: ${p.title}
Price: ₹${p.price}
Description: ${p.description}
Category: ${p.category}
`).join("\n");
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // latest stable groq model
      messages: [
        {
          role: "system",
          content: `
You are an intelligent ecommerce AI assistant.

Rules:
- Always respond naturally like ChatGPT.
- Understand user intent automatically.
- If user asks price, include price.
- If user asks description, explain product.
- If both asked, include both.
- If product not found, suggest alternatives.
- Never say you are an AI model.
- Always give helpful response.
`,
        },
        {
          role: "user",
          content: `
User message:
${message}

Available products:
${productInfo}
`,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.log("AI ERROR:", error.message);
    return "Sorry, AI is temporarily unavailable.";
  }
};

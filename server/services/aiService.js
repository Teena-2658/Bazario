import OpenAI from "openai";

export const generateAIReply = async ({
  message,
  products,
  history
}) => {

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const systemPrompt = `
You are an AI assistant for an ecommerce store.

Rules:
- Only answer product related questions.
- Do NOT answer political or religious questions.
- Do NOT invent products.
- Only use products provided.
`;

  const productContext = `
Available products:
${products.length > 0
      ? products.map(p =>
        `- ${p.name} - ₹${p.price} - ${p.category}`
      ).join("\n")
      : "No matching products found."
    }
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "system", content: productContext },
      ...history.slice(-5),
      { role: "user", content: message }
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
};

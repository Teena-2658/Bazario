import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askAI = async (message) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are an ecommerce AI assistant. Help users find products and respond clearly.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("AI ERROR:", error.message);
    return "AI service temporarily unavailable. Please try again.";
  }
};

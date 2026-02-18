import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askAI = async (message) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful ecommerce AI assistant.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    return completion?.choices?.[0]?.message?.content || 
           "No response from AI.";

  } catch (error) {
    console.log("AI ERROR:", error.message);
    return "AI temporarily unavailable.";
  }
};

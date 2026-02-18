import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askAI = async (message) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are an ecommerce AI assistant.

Return ONLY JSON in this format:

{
  "intent": "price_query | description_query | category_search | section_search | general",
  "productName": "product name or null",
  "category": "category name or null",
  "section": "spotlight | trending | everyday | null"
}

Examples:

User: cost of men casual shirt
Response:
{
  "intent": "price_query",
  "productName": "men casual shirt",
  "category": null,
  "section": null
}
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const text = completion.choices[0].message.content;

    return JSON.parse(text);

  } catch (error) {
    console.log("AI ERROR:", error.message);

    return {
      intent: "general",
      productName: null,
      category: null,
      section: null,
    };
  }
};

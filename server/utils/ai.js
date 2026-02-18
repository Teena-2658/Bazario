import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async (message) => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an ecommerce assistant.

Extract intent from user message.

Return ONLY valid JSON like:
{
  "intent": "",
  "category": "",
  "section": "",
  "productName": "",
  "maxPrice": ""
}

intent values:
price_query
description_query
category_search
section_search
product_search
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
    });

    const text = response.choices[0].message.content;

    return JSON.parse(text);
  } catch (err) {
    console.log("AI ERROR:", err);
    return null;
  }
};

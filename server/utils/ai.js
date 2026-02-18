import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =================================
   AI FUNCTION (INTENT DETECTION)
================================= */

export const askAI = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an ecommerce AI assistant.

Your job is to detect user intent from message.

Return ONLY JSON in this format:

{
  "intent": "",
  "category": "",
  "section": "",
  "productName": "",
  "maxPrice": ""
}

intent can be:
price_query
description_query
category_search
section_search
product_search

Rules:
- Understand wrong spelling
- Ignore uppercase/lowercase
- Understand casual language
- If unsure, return product_search
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.log("AI Error:", error);
    return JSON.stringify({
      intent: "product_search",
      category: "",
      section: "",
      productName: message,
      maxPrice: "",
    });
  }
};

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

Return ONLY valid JSON in this format:

{
  "intent": "price_query | description_query | category_search | section_search | product_search",
  "category": "",
  "section": "",
  "productName": "",
  "maxPrice": ""
}

DO NOT add explanation.
DO NOT add text outside JSON.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
    });

    const text = response.choices[0].message.content.trim();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.log("JSON Parse Failed:", text);

      return {
        intent: "product_search",
        category: "",
        section: "",
        productName: message,
        maxPrice: "",
      };
    }
  } catch (err) {
    console.log("AI ERROR:", err);

    return {
      intent: "product_search",
      category: "",
      section: "",
      productName: message,
      maxPrice: "",
    };
  }
};

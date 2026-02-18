import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async (message, products) => {
  const productText = products
    .map(p => `${p.title} - ${p.category} - ₹${p.price}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an ecommerce assistant. Answer only using given products.",
      },
      {
        role: "user",
        content: `Products:\n${productText}\n\nUser Question: ${message}`,
      },
    ],
  });

  return completion.choices[0].message.content;
};

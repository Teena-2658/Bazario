import Product from "../models/Product.js"

export const getRelevantProducts = async (query) => {

  let products = await Product.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" }, title: 1, price: 1, category: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(6)

  // Fallback regex search
  if (products.length === 0) {
    products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).limit(6)
  }

  return products.map(p => ({
    name: p.title,
    price: p.price,
    category: p.category
  }))
}

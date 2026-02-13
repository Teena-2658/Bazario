import { useEffect, useState } from "react";

const ProductSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products?limit=12")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-md shadow-sm mt-4">
      <h2 className="text-lg font-semibold mb-4">Best Deals</h2>

      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-md p-4 hover:shadow-md transition"
          >
            <img
              src={product.image}
              alt={product.title}
              className="h-40 w-full object-contain"
            />
            <h3 className="mt-3 text-sm font-medium line-clamp-2">
              {product.title}
            </h3>
            <p className="text-green-600 font-semibold mt-1">
              ₹{Math.floor(product.price * 80)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;

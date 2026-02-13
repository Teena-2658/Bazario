import { useEffect, useState } from "react";

const ProductRow = ({ title, url }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch((err) => console.log(err));
  }, [url]);

  return (
    <div className="bg-red-500 p-4 rounded-xl">
      {/* White inner container */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[200px] bg-white border rounded-lg p-4 
              transition-all duration-300 
              hover:shadow-xl hover:-translate-y-2 hover:scale-105 cursor-pointer"
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-36 w-full object-contain"
              />

              <h3 className="mt-3 text-sm font-medium line-clamp-2">
                {product.title}
              </h3>

              <p className="text-green-600 font-semibold mt-1">
                ₹{product.price * 80}
              </p>

              <p className="text-xs text-gray-500">
                {product.discountPercentage}% off
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRow;

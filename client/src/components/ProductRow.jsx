import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const ProductRow = ({ title, url }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [url]);

  return (
    <div className="px-10 py-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {products.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default ProductRow;

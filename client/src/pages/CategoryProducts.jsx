import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const API_URL = "https://bazario-eg4p.onrender.com";

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products/category/${category}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [category]);

  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 capitalize">
        {category} Products
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {products.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;

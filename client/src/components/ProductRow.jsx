import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const ProductRow = ({ title, url, priceFilter }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewAll, setViewAll] = useState(false);

  // 🔹 Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, [url]);

  // 🔹 Apply Price Filter
  useEffect(() => {
    let updated = [...products];

    if (priceFilter === "under1000") {
      updated = updated.filter((p) => p.price <= 1000);
    }

    if (priceFilter === "under5000") {
      updated = updated.filter((p) => p.price <= 5000);
    }

    if (priceFilter === "low") {
      updated.sort((a, b) => a.price - b.price);
    }

    if (priceFilter === "high") {
      updated.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updated);
  }, [products, priceFilter]);

  return (
    <div className="mb-10">
      {/* 🔹 Title + View All */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>

        <button
          onClick={() => setViewAll(!viewAll)}
          className="text-blue-600 font-medium hover:underline"
        >
          {viewAll ? "Show Less" : "View All"}
        </button>
      </div>

      {/* 🔹 Layout Switch */}
      {viewAll ? (
        // ✅ GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        // ✅ HORIZONTAL SCROLL VIEW
        <div className="flex gap-6 overflow-x-auto pb-4 pr-6 scroll-smooth">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-[280px] transition-transform duration-300 hover:scale-105"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductRow;

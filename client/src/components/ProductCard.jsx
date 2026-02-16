// src/components/ProductCard.jsx

import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

const handleAddToCart = async (e) => {
  e.stopPropagation();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return;
  }

  // ✅ navbar count instantly increase
  window.dispatchEvent(new Event("cartIncrement"));

  await fetch("http://localhost:5000/api/user/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      productId: product._id,
    }),
  });
};


const handleWishlist = async (e) => {
  e.stopPropagation();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return;
  }

  // ✅ instant increase
  window.dispatchEvent(new Event("wishlistIncrement"));

  await fetch("http://localhost:5000/api/user/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      productId: product._id,
    }),
  });
};


return (
  <div
    onClick={() => navigate(`/product/${product._id}`)}
    className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer relative flex flex-col"
  >
    {/* Wishlist Button */}
    <button
      onClick={handleWishlist}
      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow z-10"
    >
      <Heart size={18} />
    </button>

    <img
      src={product.image}
      alt={product.title}
      className="h-40 w-full object-contain"
    />

    <h3 className="mt-2 font-medium">{product.title}</h3>

    <p className="text-red-500 font-semibold">
      ₹{product.price}
    </p>

    {/* FORCE visible test button */}
    <button
      onClick={handleAddToCart}
      className="mt-3 bg-green-600 text-white py-2 rounded"
    >
      Add to Cart
    </button>
  </div>
);

};

export default ProductCard;

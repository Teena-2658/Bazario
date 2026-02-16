import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { API_URL } from "../config";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.role === "vendor";

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await fetch(`${API_URL}/api/user/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      window.dispatchEvent(new Event("cartIncrement"));
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await fetch(`${API_URL}/api/user/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      window.dispatchEvent(new Event("wishlistIncrement"));
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative"
    >
      {/* Image */}
      <img
        src={product.image || "https://via.placeholder.com/200"}
        alt={product.title || "Product"}
        className="w-full h-48 object-contain"
      />

      {/* Title */}
      <h3 className="mt-2 font-semibold text-sm line-clamp-2">
        {product.title || "No Title"}
      </h3>

      {/* Price */}
      <p className="text-gray-700 font-bold mt-1">
        ₹{product.price ?? 0}
      </p>

      {/* Buttons (hide for vendor) */}
      {!isVendor && (
        <div className="flex justify-between mt-3">
          <button
            onClick={handleWishlist}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Heart size={18} />
          </button>

          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

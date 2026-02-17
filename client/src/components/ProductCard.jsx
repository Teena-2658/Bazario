import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { API_URL } from "../config";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.role === "vendor";

  if (!product) return null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");

    try {
      const res = await fetch(`${API_URL}/api/user/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (res.ok) {
        toast.success("🛒 Added to cart!");
        window.dispatchEvent(new Event("cartIncrement"));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add to cart!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding to cart!");
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");

    try {
      const res = await fetch(`${API_URL}/api/user/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (res.ok) {
        toast.success("❤️ Added to wishlist!");
        window.dispatchEvent(new Event("wishlistIncrement"));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add to wishlist!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding to wishlist!");
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative flex flex-col justify-between"
    >
      <img
        src={product.image || "https://via.placeholder.com/200"}
        alt={product.title || "Product"}
        className="w-full h-48 object-contain mb-2"
      />
      <h3 className="mt-2 font-semibold text-sm line-clamp-2">
        {product.title || "No Title"}
      </h3>
      <p className="text-gray-700 font-bold mt-1">₹{product.price ?? 0}</p>

      {!isVendor && (
        <div className="flex justify-between mt-3">
          <button
            onClick={handleWishlist}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart size={20} className="text-pink-500" />
          </button>

          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart size={20} className="text-green-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

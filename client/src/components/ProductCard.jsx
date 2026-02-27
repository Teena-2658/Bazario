import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { API_URL } from "../config";
import { toast } from "react-toastify";

const ProductCard = ({ product, onBuyNow }) => {
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
const handleBuyNow = async (e) => {
  e.stopPropagation();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return;
  }

  console.log("USER:", user);
  console.log("PRODUCT ID:", product?._id);

  try {
    const res = await fetch(
      `${API_URL}/api/orders/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          productId: product?._id,  // if this fails we'll change to product
          qty: 1,
          shippingAddress: {
            address: "Test Address",
            city: "Test City",
            pincode: "123456",
            phone: "9999999999",
          },
        }),
      }
    );

    const data = await res.json();

    console.log("STATUS:", res.status);
    console.log("SERVER RESPONSE:", data);

    if (!res.ok) {
      toast.error(data.message || "Failed to initiate payment");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("No payment URL received");
    }

  } catch (error) {
    console.error("CATCH ERROR:", error);
    toast.error("Error processing payment");
  }
};
  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative flex flex-col justify-between"
    >
      <img
  src={product.image}
  alt={product.title}
  className="w-full h-40 object-cover rounded"
/>

<h3 className="mt-2 font-bold">{product.title}</h3>
<p>₹ {product.price}</p>

{/* ⭐ Rating Section */}
{product.averageRating > 0 ? (
  <div className="flex items-center gap-2 mt-1">
   <div className="text-yellow-400 text-sm">
  {"★".repeat(Math.round(product.averageRating))}
  {"☆".repeat(5 - Math.round(product.averageRating))}
</div>
    <span className="text-gray-600 text-xs font-medium">
      {product.averageRating.toFixed(1)}
    </span>
    <span className="text-gray-500 text-xs">
      ({product.totalReviews || 0})
    </span>
  </div>
) : (
  <p className="text-gray-400 text-xs mt-1">No reviews yet</p>
)}

{/* 👍 👎 Quick Feedback Summary */}
{product.goodCount > 0 || product.badCount > 0 ? (
  <div className="flex items-center gap-3 mt-1 text-xs">
    <span className="text-green-600 font-medium">
      👍 {product.goodCount || 0}
    </span>
    <span className="text-red-500 font-medium">
      👎 {product.badCount || 0}
    </span>
  </div>
) : null}
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

      {!isVendor && (
  <div className="mt-3 flex flex-col gap-2">

  

  <button
  onClick={(e) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    }
  }}
  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium"
>
  Buy Now
</button>

  </div>
)}
    </div>
  );
};

export default ProductCard;

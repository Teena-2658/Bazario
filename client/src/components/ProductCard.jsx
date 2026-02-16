import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { API_URL } from "../config";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.role === "vendor";

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    window.dispatchEvent(new Event("cartIncrement"));

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
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    window.dispatchEvent(new Event("wishlistIncrement"));

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
  };

  // JSX same rahega
};

export default ProductCard;

import { useEffect, useState } from "react";
import BannerSlider from "../components/BannerSlider";
import Categories from "../components/Categories";
import ProductRow from "../components/ProductRow";
import { API_URL } from "../config";
import Chatbot from "../components/Chatbot";
const Home = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch initial counts
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const cartRes = await fetch(`${API_URL}/api/user/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cartData = await cartRes.json();
        setCartCount(cartData.length);

        const wishRes = await fetch(`${API_URL}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const wishData = await wishRes.json();
        setWishlistCount(wishData.length);
      } catch (err) {
        console.error("Failed to fetch counts", err);
      }
    };

    fetchCounts();
  }, []);

  // Listen for events from ProductCard
  useEffect(() => {
    const handleCartIncrement = () => setCartCount((prev) => prev + 1);
    const handleWishlistIncrement = () => setWishlistCount((prev) => prev + 1);

    window.addEventListener("cartIncrement", handleCartIncrement);
    window.addEventListener("wishlistIncrement", handleWishlistIncrement);

    return () => {
      window.removeEventListener("cartIncrement", handleCartIncrement);
      window.removeEventListener("wishlistIncrement", handleWishlistIncrement);
    };
  }, []);

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* You can show cart & wishlist counts anywhere */}
       <div className="flex justify-end gap-6 py-4">
 
</div>

        <div className="mt-4">
          <BannerSlider />
        </div>

        <div className="mt-4 bg-white rounded-lg shadow">
          <Categories />
        </div>

        <div className="mt-6 space-y-6">
          <ProductRow
            title="Spotlight's On"
            url={`${API_URL}/api/products/section/spotlight`}
          />

          <ProductRow
            title="Trends You May Like"
            url={`${API_URL}/api/products/section/trending`}
          />

          <ProductRow
            title="In Demand"
            url={`${API_URL}/api/products/section/indemand`}
          />

          <ProductRow
            title="On Everybody's List"
            url={`${API_URL}/api/products/section/everybody`}
          />
        </div>
<Chatbot />
      </div>
    </div>
  );
};

export default Home;

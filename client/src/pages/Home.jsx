import { useEffect, useState } from "react";
import BannerSlider from "../components/BannerSlider";
import Categories from "../components/Categories";
import ProductRow from "../components/ProductRow";
import { API_URL } from "../config";
import Chatbot from "../components/Chatbot";
import axios from "axios";
const Home = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // ✅ ADD THESE
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

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

  // Listen for cart/wishlist increment
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
useEffect(() => {
  axios.post(`${API_URL}/api/visits/track`);
}, []);
  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4">

        <div className="mt-4">
          <BannerSlider />
        </div>

        {/* Categories */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <Categories />

          {user && (
            <div className="mt-6 border-t pt-4 flex flex-wrap gap-4 items-center">

              {/* 🔎 Search Bar */}
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[250px] border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />

              {/* 💰 Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sort by Price</option>
                <option value="under1000">Under ₹1000</option>
                <option value="under5000">Under ₹5000</option>
                <option value="low">Low to High</option>
                <option value="high">High to Low</option>
              </select>

            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="mt-6 space-y-6">

          {searchQuery ? (
            <ProductRow
              title={`Search Results for "${searchQuery}"`}
              url={`${API_URL}/api/products/search?q=${searchQuery}`}
              priceFilter={priceFilter}
            />
          ) : (
            <>
              <ProductRow
                title="Spotlight's On"
                url={`${API_URL}/api/products/section/spotlight`}
                priceFilter={priceFilter}
              />
              <ProductRow
                title="Trends You May Like"
                url={`${API_URL}/api/products/section/trending`}
                priceFilter={priceFilter}
              />
              <ProductRow
                title="In Demand"
                url={`${API_URL}/api/products/section/indemand`}
                priceFilter={priceFilter}
              />
              <ProductRow
                title="On Everybody's List"
                url={`${API_URL}/api/products/section/everybody`}
                priceFilter={priceFilter}
              />
            </>
          )}

        </div>

        <Chatbot />
      </div>
    </div>
  );
};

export default Home;

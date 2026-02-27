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

  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  // ✅ Checkout Modal States
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
const [phone, setPhone] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ===========================
  // Fetch Cart & Wishlist Count
  // ===========================
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const cartRes = await fetch(`${API_URL}/api/user/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cartData = await cartRes.json();
        setCartCount(Array.isArray(cartData) ? cartData.length : 0);

        const wishRes = await fetch(`${API_URL}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const wishData = await wishRes.json();
        setWishlistCount(Array.isArray(wishData) ? wishData.length : 0);
      } catch (err) {
        console.error("Failed to fetch counts", err);
      }
    };

    fetchCounts();
  }, [user]);

  // ===========================
  // Buy Now Handler
  // ===========================
  const handleBuyNow = (product) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setSelectedProduct(product);
    setFullName(user?.name || "");
    setAddress("");
    setShowCheckoutForm(true);
  };

  // ===========================
  // Payment Function
  // ===========================
const handlePayment = async () => {
  if (!selectedProduct) {
    alert("No product selected");
    return;
  }

  if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
    alert("Please enter full name (First & Last)");
    return;
  }

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    alert("Enter valid 10 digit phone number");
    return;
  }

  if (!city.trim()) {
    alert("City is required");
    return;
  }

  if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
    alert("Enter valid 6 digit pincode");
    return;
  }

  if (!address.trim() || address.trim().length < 5) {
    alert("Address too short");
    return;
  }

  try {
    setLoadingPayment(true);

    const res = await axios.post(
      `${API_URL}/api/orders/create-checkout-session`,
      {
        productId: selectedProduct._id,
        qty: 1,
        shippingAddress: {
          name: fullName,
          phone: phone,
          address: address,
          city: city,
          pincode: pincode,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    window.location.href = res.data.url;

  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Payment failed");
  } finally {
    setLoadingPayment(false);
  }
};

  // ===========================
  // Cart / Wishlist Events
  // ===========================
  useEffect(() => {
    const handleCartIncrement = () =>
      setCartCount((prev) => prev + 1);

    const handleWishlistIncrement = () =>
      setWishlistCount((prev) => prev + 1);

    window.addEventListener("cartIncrement", handleCartIncrement);
    window.addEventListener("wishlistIncrement", handleWishlistIncrement);

    return () => {
      window.removeEventListener("cartIncrement", handleCartIncrement);
      window.removeEventListener("wishlistIncrement", handleWishlistIncrement);
    };
  }, []);

  // ===========================
  // Visit Tracking
  // ===========================
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await axios.post(`${API_URL}/api/visits/track`);
      } catch (err) {
        console.error("Visit tracking failed:", err.message);
      }
    };
    trackVisit();
  }, []);

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4">

        <div className="mt-4">
          <BannerSlider />
        </div>

        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <Categories />

          {user && (
            <div className="mt-6 border-t pt-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[250px] border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />

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

        <div className="mt-6 space-y-6">

          {searchQuery ? (
            <ProductRow
              title={`Search Results for "${searchQuery}"`}
              url={`${API_URL}/api/products/search?q=${searchQuery}`}
              priceFilter={priceFilter}
              onBuyNow={handleBuyNow}   // ✅ IMPORTANT FIX
            />
          ) : (
            <>
              <ProductRow
                title="Spotlight's On"
                url={`${API_URL}/api/products/section/spotlight`}
                priceFilter={priceFilter}
                onBuyNow={handleBuyNow}
              />
              <ProductRow
                title="Trends You May Like"
                url={`${API_URL}/api/products/section/trending`}
                priceFilter={priceFilter}
                onBuyNow={handleBuyNow}
              />
              <ProductRow
                title="In Demand"
                url={`${API_URL}/api/products/section/indemand`}
                priceFilter={priceFilter}
                onBuyNow={handleBuyNow}
              />
              <ProductRow
                title="On Everybody's List"
                url={`${API_URL}/api/products/section/everybody`}
                priceFilter={priceFilter}
                onBuyNow={handleBuyNow}
              />
            </>
          )}

          {/* ================== Checkout Modal ================== */}
          {showCheckoutForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                <h2 className="text-lg font-semibold mb-4">
                  Checkout - {selectedProduct?.name}
                </h2>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border p-2 mb-3 rounded"
                />
<input
  type="text"
  placeholder="Phone (10 digits)"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="w-full border p-2 mb-3 rounded"
/>

<input
  type="text"
  placeholder="City"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  className="w-full border p-2 mb-3 rounded"
/>

<input
  type="text"
  placeholder="Pincode (6 digits)"
  value={pincode}
  onChange={(e) => setPincode(e.target.value)}
  className="w-full border p-2 mb-3 rounded"
/>
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-2 mb-3 rounded"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 bg-gray-300 py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handlePayment}
                    disabled={loadingPayment}
                    className="flex-1 bg-blue-600 text-white py-2 rounded"
                  >
                    {loadingPayment ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        <Chatbot />
      </div>
    </div>
  );
};

export default Home;
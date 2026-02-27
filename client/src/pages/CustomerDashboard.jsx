import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storedUser.token || "";

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({
    cart: true,
    wishlist: true,
    orders: true,
    profile: true,
  });

  const [fetchError, setFetchError] = useState({
    cart: null,
    wishlist: null,
    orders: null,
    profile: null,
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showExperiencePopup, setShowExperiencePopup] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [shippingErrors, setShippingErrors] = useState({});

  const [profile, setProfile] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    phone: "",
    city: "",
    address: "",
    image: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // ─── Validation ───────────────────────────────────────────────
  const validateShipping = () => {
    const errors = {};
    if (!shipping.name?.trim() || shipping.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!/^[0-9]{10}$/.test(shipping.phone))
      errors.phone = "Phone must be exactly 10 digits";
    if (!shipping.address?.trim() || shipping.address.trim().length < 5)
      errors.address = "Address must be at least 5 characters";
    if (!shipping.city?.trim()) errors.city = "City is required";
    if (!/^[0-9]{6}$/.test(shipping.pincode))
      errors.pincode = "Pincode must be exactly 6 digits";

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfile = () => {
    const errors = {};
    if (!profile.name?.trim() || profile.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (profile.phone && !/^[0-9]{10}$/.test(profile.phone))
      errors.phone = "Phone must be 10 digits";
    if (profile.address && profile.address.trim().length < 5)
      errors.address = "Address must be at least 5 characters";

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Load Profile ─────────────────────────────────────────────
  const loadProfile = async () => {
    if (!token || !storedUser._id) return;

    setLoading((prev) => ({ ...prev, profile: true }));
    setFetchError((prev) => ({ ...prev, profile: null }));

    try {
      const res = await fetch(`${API_URL}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);

      const data = await res.json();
      setProfile({
        name: data.name || storedUser.name || "",
        email: data.email || storedUser.email || "",
        phone: data.phone || "",
        city: data.city || "",
        address: data.address || "",
        image: data.image || "",
      });
    } catch (err) {
      console.error("Profile load failed:", err);
      setFetchError((prev) => ({ ...prev, profile: "Failed to load profile" }));
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // ─── Initial Data Fetch ───────────────────────────────────────
  useEffect(() => {
    if (!storedUser._id || !token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      // Orders
      try {
        const orderRes = await fetch(`${API_URL}/api/orders/my-orders`, { headers });
        if (orderRes.ok) {
          setOrders((await orderRes.json()) || []);
        } else {
          setFetchError((p) => ({ ...p, orders: "Failed to load orders" }));
        }
      } catch {
        setFetchError((p) => ({ ...p, orders: "Network error" }));
      } finally {
        setLoading((p) => ({ ...p, orders: false }));
      }

      // Cart
      try {
        const cartRes = await fetch(`${API_URL}/api/user/cart`, { headers });
        if (cartRes.ok) {
          setCart((await cartRes.json()).reverse() || []);
        }
      } catch {
        setFetchError((p) => ({ ...p, cart: "Failed to load cart" }));
      } finally {
        setLoading((p) => ({ ...p, cart: false }));
      }

      // Wishlist
      try {
        const wishRes = await fetch(`${API_URL}/api/user/wishlist`, { headers });
        if (wishRes.ok) {
          const data = await wishRes.json();
          setWishlist(data.map((p) => ({ product: p, qty: 1 })).reverse() || []);
        }
      } catch {
        setFetchError((p) => ({ ...p, wishlist: "Failed to load wishlist" }));
      } finally {
        setLoading((p) => ({ ...p, wishlist: false }));
      }

      await loadProfile();
    };

    fetchData();
  }, [navigate, token, storedUser._id]);

  useEffect(() => {
    if (activeTab === "profile") loadProfile();
  }, [activeTab]);

  // ─── Profile Update ───────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      const res = await fetch(`${API_URL}/api/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        localStorage.setItem("user", JSON.stringify({ ...storedUser, name: updated.name, email: updated.email }));
        setIsEditingProfile(false);
        alert("Profile updated successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error(err);
    }
  };

  // ─── Cart / Wishlist Actions ──────────────────────────────────
  const removeCartItem = async (productId) => {
    try {
      await fetch(`${API_URL}/api/user/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) => prev.filter((item) => item?.product?._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const removeWishlistItem = async (productId) => {
    try {
      await fetch(`${API_URL}/api/user/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((item) => item?.product?._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await fetch(`${API_URL}/api/user/cart-clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart([]);
    } catch (err) {
      console.error(err);
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm("Clear entire wishlist?")) return;
    try {
      await fetch(`${API_URL}/api/user/wishlist-clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuy = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setShipping({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      pincode: "",
    });
  };

  const placeOrder = async () => {
    if (!selectedItem || !validateShipping()) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedItem.product._id,
          qty: selectedItem.qty || 1,
          shippingAddress: shipping,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to create payment session");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
      console.error(err);
    }
  };

  // ─── Review Handlers ──────────────────────────────────────────
  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewRating(0);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (reviewRating === 0) {
      alert("Please select a rating.");
      return;
    }
    if (reviewComment.trim().length < 10) {
      alert("Please write at least 10 characters.");
      return;
    }

    setShowReviewModal(false);
    setShowExperiencePopup(true);
  };

  const submitFinalReview = async (experience) => {
    setReviewSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedOrder.product._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
          experience,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Review failed");
      }

      alert("Review submitted successfully!");

      const orderRes = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (orderRes.ok) {
        setOrders(await orderRes.json());
      }

      setShowExperiencePopup(false);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredCart = cart.filter((item) =>
    item?.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWishlist = wishlist.filter((item) =>
    item?.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabClass = (tab) =>
    `w-full text-left px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${
      activeTab === tab
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const renderItemCard = (item, tab) => (
    <div
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${item.product._id}?from=dashboard`)}
    >
      <div className="relative pt-[75%] bg-gray-50">
        <img
          src={item.product.image}
          alt={item.product.title}
          className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => (e.target.src = "https://via.placeholder.com/300?text=No+Image")}
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.8rem]">{item.product.title}</h3>
        <p className="text-xl font-bold text-red-600 mt-2">
          ₹{item.product.price?.toLocaleString("en-IN") || "—"}
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuy(item);
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition shadow-sm"
          >
            Buy Now
          </button>

          {tab === "cart" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeCartItem(item.product._id);
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl font-medium transition border border-red-200"
            >
              Remove
            </button>
          )}

          {tab === "wishlist" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeWishlistItem(item.product._id);
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl font-medium transition border border-red-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ title, message, actionText, onAction, icon = "🛒" }) => (
    <div className="text-center py-24 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-dashed border-gray-300">
      <div className="text-8xl mb-6 opacity-80">{icon}</div>
      <h3 className="text-3xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto">{message}</p>
      {actionText && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg font-medium text-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-72 xl:w-80 bg-white shadow-2xl p-8 fixed h-full overflow-y-auto">
        <div className="flex items-center gap-4 mb-10">
          <img
            src={
              profile.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=0D8ABC&color=fff&size=128`
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100 shadow"
            onError={(e) => (e.target.src = "https://ui-avatars.com/api/?name=U")}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              Hi, {profile.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="text-sm text-gray-500">Welcome back</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={tabClass("dashboard")}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab("cart")} className={tabClass("cart")}>
            Cart ({cart.length})
          </button>
          <button onClick={() => setActiveTab("wishlist")} className={tabClass("wishlist")}>
            Wishlist ({wishlist.length})
          </button>
          <button onClick={() => setActiveTab("orders")} className={tabClass("orders")}>
            Orders ({orders.length})
          </button>
          <button onClick={() => setActiveTab("profile")} className={tabClass("profile")}>
            Profile
          </button>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="mt-12 w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3.5 rounded-xl font-medium shadow transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 xl:ml-80 min-h-screen">
        <div className="p-6 lg:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow transition"
            >
              ← Back to Home
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center sm:text-left">
              {activeTab === "dashboard" ? "Welcome Back" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>

            <div className="hidden lg:block w-40" />
          </div>

          {(activeTab === "cart" || activeTab === "wishlist") && (
            <div className="max-w-2xl mx-auto mb-10">
              <input
                className="w-full px-6 py-4 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm transition"
                placeholder="Search in your list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* ── Dashboard ───────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Cart Items", value: cart.length, color: "blue" },
                  { title: "Wishlist", value: wishlist.length, color: "emerald" },
                  { title: "Orders", value: orders.length, color: "purple" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`bg-white p-8 rounded-2xl shadow-md border-t-4 border-${stat.color}-500 text-center transform hover:scale-[1.02] transition`}
                  >
                    <h3 className="text-lg font-medium text-gray-600">{stat.title}</h3>
                    <p className={`text-5xl font-extrabold mt-4 text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-10 rounded-2xl shadow-md text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Quick Actions</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl shadow-lg font-medium text-lg transition"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Cart ────────────────────────────────────────────────── */}
          {activeTab === "cart" && (
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">My Cart ({cart.length})</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 font-medium underline-offset-4 hover:underline"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {loading.cart ? (
                <LoadingSpinner />
              ) : fetchError.cart ? (
                <div className="text-center py-24 text-red-600">
                  <p className="text-2xl font-medium">{fetchError.cart}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-10 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow"
                  >
                    Retry
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <EmptyState
                  title="Your cart is empty"
                  message="Looks like you haven't added anything yet. Start exploring!"
                  actionText="Browse Products"
                  onAction={() => navigate("/products")}
                  icon="🛍️"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCart.map((item) => renderItemCard(item, "cart"))}
                </div>
              )}
            </div>
          )}

          {/* ── Wishlist ────────────────────────────────────────────── */}
          {activeTab === "wishlist" && (
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">My Wishlist ({wishlist.length})</h2>
                {wishlist.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    className="text-red-600 hover:text-red-800 font-medium underline-offset-4 hover:underline"
                  >
                    Clear Wishlist
                  </button>
                )}
              </div>

              {loading.wishlist ? (
                <LoadingSpinner />
              ) : fetchError.wishlist ? (
                <div className="text-center py-24 text-red-600">
                  <p className="text-2xl font-medium">{fetchError.wishlist}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-10 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow"
                  >
                    Retry
                  </button>
                </div>
              ) : wishlist.length === 0 ? (
                <EmptyState
                  title="Wishlist is empty"
                  message="Save products you love for later — they'll be waiting here!"
                  actionText="Explore Now"
                  onAction={() => navigate("/products")}
                  icon="❤️"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredWishlist.map((item) => renderItemCard(item, "wishlist"))}
                </div>
              )}
            </div>
          )}

          {/* ── Orders ──────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-md">
              <h2 className="text-3xl font-bold mb-10 text-gray-900">My Orders ({orders.length})</h2>

              {loading.orders ? (
                <LoadingSpinner />
              ) : fetchError.orders ? (
                <div className="text-center py-24 text-red-600">
                  <p className="text-2xl font-medium">{fetchError.orders}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-10 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow"
                  >
                    Retry
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  message="Your first order will appear here. Happy shopping!"
                  actionText="Start Shopping"
                  onAction={() => navigate("/products")}
                  icon="📦"
                />
              ) : (
                <div className="space-y-8">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition"
                    >
                      <img
                        src={order.product?.image || "https://via.placeholder.com/180?text=Product"}
                        alt={order.product?.title}
                        className="w-full md:w-40 h-40 object-contain bg-white rounded-xl border p-4 flex-shrink-0"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/180?text=Image+Error")}
                      />

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 line-clamp-2">
                              {order.product?.title || "Product Unavailable"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Order #{order._id?.slice(-8)?.toUpperCase() || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Qty:</span> {order.qty || 1}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Status:</span>{" "}
                            <span
                              className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mt-1.5 ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "Paid" || order.status === "Processing"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Ordered:</span>{" "}
                            <div className="mt-1">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : "Recently"}
                            </div>
                          </div>
                        </div>

                        {/* Review Section */}
                        <div className="pt-6 border-t border-gray-200">
                          {order.status === "Paid" && !order.review && (
                            <button
                              onClick={() => openReviewModal(order)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow transition"
                            >
                              <span className="text-xl">☆</span> Rate & Review
                            </button>
                          )}

                          {order.review && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                              <div className="flex items-center gap-1 text-2xl text-yellow-400 mb-3">
                                {"★".repeat(order.review.rating)}
                                {"☆".repeat(5 - order.review.rating)}
                              </div>
                              <p className="text-gray-700 leading-relaxed">{order.review.comment}</p>

                              <div className="flex gap-4 mt-5">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setReviewRating(order.review.rating);
                                    setReviewComment(order.review.comment);
                                    setShowReviewModal(true);
                                  }}
                                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                                >
                                  Edit Review
                                </button>
                                
                              </div>
                            </div>
                          )}

                          {order.status !== "Paid" && !order.review && (
                            <p className="text-gray-500 italic text-sm">
                              You can review this product after successful payment
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Profile ─────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-md max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
                {isEditingProfile ? "Edit Your Profile" : "My Profile"}
              </h2>

              {loading.profile ? (
                <LoadingSpinner />
              ) : fetchError.profile ? (
                <div className="text-center py-24 text-red-600">
                  <p className="text-2xl font-medium">{fetchError.profile}</p>
                  <button
                    onClick={() => loadProfile()}
                    className="mt-6 px-10 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow"
                  >
                    Retry
                  </button>
                </div>
              ) : isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      />
                      {profileErrors.name && <p className="text-red-600 text-sm mt-2">{profileErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                      {profileErrors.phone && <p className="text-red-600 text-sm mt-2">{profileErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition min-h-[100px]"
                      rows={3}
                    />
                    {profileErrors.address && <p className="text-red-600 text-sm mt-2">{profileErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo URL</label>
                    <input
                      type="url"
                      value={profile.image}
                      onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  </div>

                  <div className="flex justify-end gap-5 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        loadProfile();
                      }}
                      className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow transition font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="relative">
                      <img
                        src={
                          profile.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&size=160&background=0D8ABC&color=fff`
                        }
                        alt="Profile"
                        className="w-48 h-48 rounded-full object-cover ring-8 ring-blue-50 shadow-xl"
                      />
                    </div>

                    <div className="text-center md:text-left space-y-4 flex-1">
                      <h3 className="text-4xl font-bold text-gray-900">{profile.name || "—"}</h3>
                      <p className="text-xl text-gray-700">{profile.email}</p>
                      <p className="text-lg text-gray-600">{profile.phone || "No phone number added"}</p>
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <h4 className="font-semibold text-xl mb-4 text-gray-800">Address</h4>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {profile.address || "No address added"}
                      {profile.address && profile.city && ", "}
                      {profile.city || ""}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow transition font-medium text-lg"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping Modal */}
          {showModal && selectedItem && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 max-h-[92vh] overflow-y-auto">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Shipping Details</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                    />
                    {shippingErrors.name && <p className="text-red-600 text-sm mt-2">{shippingErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone (10 digits)</label>
                    <input
                      type="text"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                      maxLength={10}
                    />
                    {shippingErrors.phone && <p className="text-red-600 text-sm mt-2">{shippingErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition min-h-[100px]"
                      rows={3}
                    />
                    {shippingErrors.address && <p className="text-red-600 text-sm mt-2">{shippingErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                      />
                      {shippingErrors.city && <p className="text-red-600 text-sm mt-2">{shippingErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={shipping.pincode}
                        onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                        maxLength={6}
                      />
                      {shippingErrors.pincode && <p className="text-red-600 text-sm mt-2">{shippingErrors.pincode}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-5 pt-8">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={placeOrder}
                      className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow transition font-medium"
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Modal */}
          {showReviewModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  Review: {selectedOrder.product?.title?.substring(0, 38)}...
                </h2>

                <div className="flex justify-center gap-2 mb-10 text-5xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`transition-transform hover:scale-110 active:scale-95 ${
                        reviewRating >= star ? "text-yellow-400" : "text-gray-200 hover:text-yellow-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your honest experience... (min 10 characters)"
                  className="w-full border border-gray-300 rounded-2xl p-5 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-y mb-8 text-gray-700"
                  maxLength={500}
                />

                <div className="flex justify-end gap-5">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={reviewSubmitting || reviewRating === 0 || reviewComment.trim().length < 10}
                    className={`px-10 py-3 text-white rounded-xl font-medium transition shadow ${
                      reviewRating === 0 || reviewComment.trim().length < 10 || reviewSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    }`}
                  >
                    {reviewSubmitting ? "Submitting..." : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Good / Bad Experience Popup */}
          {showExperiencePopup && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-10 text-gray-800">
                  Overall, was this product
                  <br />
                  <span className="text-3xl mt-2 block">Good or Bad?</span>
                </h2>

                <div className="flex justify-center gap-10">
                  <button
                    onClick={() => submitFinalReview("good")}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl px-12 py-5 rounded-2xl font-bold shadow-lg transition transform hover:scale-105 active:scale-95"
                  >
                    👍 Good
                  </button>

                  <button
                    onClick={() => submitFinalReview("bad")}
                    className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xl px-12 py-5 rounded-2xl font-bold shadow-lg transition transform hover:scale-105 active:scale-95"
                  >
                    👎 Bad
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
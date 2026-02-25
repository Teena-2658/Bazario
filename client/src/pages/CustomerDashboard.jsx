import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storedUser.token || "";
  // console.log("CustomerDashboard initialized. User:", storedUser, "Token:", token);

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

  // Validation
  const validateShipping = () => {
    const errors = {};
    if (!shipping.name?.trim() || shipping.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!/^[0-9]{10}$/.test(shipping.phone)) errors.phone = "Phone must be exactly 10 digits";
    if (!shipping.address?.trim() || shipping.address.trim().length < 5) errors.address = "Address must be at least 5 characters";
    if (!shipping.city?.trim()) errors.city = "City is required";
    if (!/^[0-9]{6}$/.test(shipping.pincode)) errors.pincode = "Pincode must be exactly 6 digits";

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfile = () => {
    const errors = {};
    if (!profile.name?.trim() || profile.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (profile.phone && !/^[0-9]{10}$/.test(profile.phone)) errors.phone = "Phone must be 10 digits";
    if (profile.address && profile.address.trim().length < 5) errors.address = "Address must be at least 5 characters";

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load Profile from MongoDB
  const loadProfile = async () => {
    if (!token || !storedUser._id) return;

    setLoading((prev) => ({ ...prev, profile: true }));
    setFetchError((prev) => ({ ...prev, profile: null }));

    try {
      const res = await fetch(`${API_URL}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("[PROFILE] Loaded from MongoDB:", data);

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

  // Initial Data Fetch
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
          const data = await orderRes.json();
          setOrders(data || []);
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
          const data = await cartRes.json();
          setCart(data.reverse() || []);
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

      // Profile (MongoDB से)
      await loadProfile();
    };

    fetchData();
  }, [navigate, token, storedUser._id]);

  useEffect(() => {
    if (activeTab === "profile") loadProfile();
  }, [activeTab]);

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

  // Cart / Wishlist / Buy / Place Order functions (same as before)
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

  const filteredCart = cart.filter((item) =>
    item?.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWishlist = wishlist.filter((item) =>
    item?.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabClass = (tab) =>
    `block w-full text-left p-3 rounded-lg transition font-medium ${
      activeTab === tab ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  const renderItemCard = (item, tab) => (
    <div
      className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer"
      onClick={() => navigate(`/product/${item.product._id}?from=dashboard`)}
    >
      <img
        src={item.product.image}
        alt={item.product.title}
        className="w-full h-44 object-contain mx-auto rounded-lg"
        onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
      />
      <h3 className="font-semibold mt-4 line-clamp-2 text-gray-900">{item.product.title}</h3>
      <p className="text-red-600 font-bold mt-1 text-lg">₹{item.product.price?.toLocaleString("en-IN") || "—"}</p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleBuy(item);
        }}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-medium"
      >
        Buy Now
      </button>

      {tab === "cart" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCartItem(item.product._id);
          }}
          className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-medium"
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
          className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-medium"
        >
          Remove
        </button>
      )}
    </div>
  );

  const EmptyState = ({ title, message, actionText, onAction, icon = "🛒" }) => (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="text-7xl mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
      {actionText && (
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl p-6 space-y-6 fixed h-full overflow-y-auto hidden lg:block">
        <div className="flex items-center space-x-3">
          <img
            src={
              profile.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=0D8ABC&color=fff&size=128`
            }
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover border-4 border-blue-100"
            onError={(e) => (e.target.src = "https://ui-avatars.com/api/?name=U")}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hi, {profile.name?.split(" ")[0] || "User"}!</h2>
            <p className="text-sm text-gray-500">Welcome to Bazario</p>
          </div>
        </div>

        <div className="space-y-1.5">
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
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition font-medium"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-6 lg:p-10">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition font-medium"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === "dashboard" ? "Welcome Back!" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="w-24 hidden lg:block" />
        </div>

        {(activeTab === "cart" || activeTab === "wishlist") && (
          <input
            className="w-full max-w-xl border border-gray-300 p-3.5 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="Search in your list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="text-lg font-semibold text-gray-700">Cart Items</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{cart.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="text-lg font-semibold text-gray-700">Wishlist</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{wishlist.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="text-lg font-semibold text-gray-700">Orders</h3>
                <p className="text-4xl font-bold text-purple-600 mt-2">{orders.length}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => setActiveTab("cart")}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === "cart" && (
          <div className="bg-white p-8 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Cart ({cart.length})</h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-red-600 hover:underline font-medium">
                  Clear Cart
                </button>
              )}
            </div>

            {loading.cart ? (
              <LoadingSpinner />
            ) : fetchError.cart ? (
              <div className="text-center py-16 text-red-600">
                <p className="text-xl font-medium">{fetchError.cart}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
                  Retry
                </button>
              </div>
            ) : cart.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                message="Start adding products you love!"
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

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="bg-white p-8 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Wishlist ({wishlist.length})</h2>
              {wishlist.length > 0 && (
                <button onClick={clearWishlist} className="text-red-600 hover:underline font-medium">
                  Clear Wishlist
                </button>
              )}
            </div>

            {loading.wishlist ? (
              <LoadingSpinner />
            ) : fetchError.wishlist ? (
              <div className="text-center py-16 text-red-600">
                <p className="text-xl font-medium">{fetchError.wishlist}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
                  Retry
                </button>
              </div>
            ) : wishlist.length === 0 ? (
              <EmptyState
                title="Wishlist is empty"
                message="Save your favorite items for later!"
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

        {/* Orders Tab */}
       {activeTab === "orders" && (
  <div className="bg-white p-8 rounded-xl shadow">
    <h2 className="text-2xl font-bold mb-8">My Orders ({orders.length})</h2>

    {loading.orders ? (
      <LoadingSpinner />
    ) : fetchError.orders ? (
      <div className="text-center py-16 text-red-600">
        <p className="text-xl font-medium">{fetchError.orders}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
          Retry
        </button>
      </div>
    ) : orders.length === 0 ? (
      <EmptyState
        title="No orders yet"
        message="Your order history will appear here once you make your first purchase."
        actionText="Start Shopping"
        onAction={() => navigate("/products")}
        icon="📦"
      />
    ) : (
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col sm:flex-row gap-6 p-6 border rounded-xl hover:bg-gray-50 transition"
          >
            {/* Product Image - safe handling */}
            <img
              src={order.product?.image || "https://via.placeholder.com/140?text=Product"}
              alt={order.product?.title || "Product Image"}
              className="w-32 h-32 object-contain bg-gray-100 rounded-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/140?text=Image+Error";
              }}
            />

            <div className="flex-1 space-y-3">
              {/* Product Title */}
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {order.product?.title || "Product Unavailable"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{order._id?.slice(-8)?.toUpperCase() || "N/A"}
                  </p>
                </div>

                {/* Price - NaN fix */}
                
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Qty:</span> {order.qty || 1}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                      order.status === "Paid" || order.status === "Processing" ? "bg-purple-100 text-purple-800" :
                      order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Ordered:</span>{" "}
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
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* Profile Tab - MongoDB से सही display */}
        {activeTab === "profile" && (
          <div className="bg-white p-8 lg:p-10 rounded-xl shadow max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {isEditingProfile ? "Edit Profile" : "My Profile"}
            </h2>

            {loading.profile ? (
              <LoadingSpinner />
            ) : fetchError.profile ? (
              <div className="text-center py-16 text-red-600">
                <p className="text-xl font-medium">{fetchError.profile}</p>
                <button onClick={() => loadProfile()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
                  Retry
                </button>
              </div>
            ) : isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                  {profileErrors.name && <p className="text-red-600 text-sm mt-1">{profileErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="10-digit number"
                  />
                  {profileErrors.phone && <p className="text-red-600 text-sm mt-1">{profileErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows={3}
                  />
                  {profileErrors.address && <p className="text-red-600 text-sm mt-1">{profileErrors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                    <input
                      type="url"
                      value={profile.image}
                      onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      loadProfile();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <img
                    src={
                      profile.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&size=160&background=0D8ABC&color=fff`
                    }
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-100 shadow-md"
                  />
                  <div className="text-center sm:text-left space-y-3">
                    <h3 className="text-3xl font-bold text-gray-900">{profile.name || "—"}</h3>
                    <p className="text-gray-700 text-lg">{profile.email}</p>
                    <p className="text-gray-600 text-base">{profile.phone || "No phone added"}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-3">Address</h4>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {profile.address || "—"}
                    {profile.address && profile.city && ", "}
                    {profile.city || ""}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Shipping Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={shipping.name}
                    onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  {shippingErrors.name && <p className="text-red-600 text-sm mt-1">{shippingErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (10 digits)</label>
                  <input
                    type="text"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    maxLength={10}
                  />
                  {shippingErrors.phone && <p className="text-red-600 text-sm mt-1">{shippingErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows={3}
                  />
                  {shippingErrors.address && <p className="text-red-600 text-sm mt-1">{shippingErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {shippingErrors.city && <p className="text-red-600 text-sm mt-1">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                      maxLength={6}
                    />
                    {shippingErrors.pincode && <p className="text-red-600 text-sm mt-1">{shippingErrors.pincode}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={placeOrder}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Proceed to Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  const [activeTab, setActiveTab] = useState("cart");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    addressLine: "",
    city: "",
    pincode: "",
    phone: "",
    paymentMethod: "Stripe",
  });

  // =============================
  // Fetch Data
  // =============================
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Cart
        const cartRes = await fetch(`${API_URL}/api/user/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cartData = await cartRes.json();
        setCart(cartData.reverse());

        // Fetch Wishlist
        const wishRes = await fetch(`${API_URL}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const wishData = await wishRes.json();
        const formattedWishlist = wishData
          .map((item) => ({ product: item, qty: 1 }))
          .reverse();
        setWishlist(formattedWishlist);

        // Fetch Orders
        const orderRes = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const orderData = await orderRes.json();
        setOrders(orderData.reverse());
      } catch (error) {
        console.log("Fetch error:", error);
      }
    };

    fetchData();
  }, []);

  // =============================
  // Buy
  // =============================
  const handleBuy = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const placeOrder = async () => {
    try {
      if (!selectedItem) return;

      const res = await fetch(
        `${API_URL}/api/orders/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: selectedItem.product._id,
            qty: selectedItem.qty,
          }),
        }
      );

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Stripe session URL not received");
    } catch (error) {
      console.log("Payment error:", error);
    }
  };

  // =============================
  // Remove / Clear Functions
  // =============================
  const removeCartItem = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/user/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok)
        setCart((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/cart-clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setCart([]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeWishlistItem = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/user/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok)
        setWishlist((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const clearWishlist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/wishlist-clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setWishlist([]);
    } catch (err) {
      console.error(err);
    }
  };

  // =============================
  // Tab Classes Helper
  // =============================
  const tabClass = (tab) =>
    `px-6 py-2 rounded-full font-semibold ${
      activeTab === tab ? "bg-black text-white" : "bg-white shadow"
    }`;

  // =============================
  // Shared Item Card
  // =============================
 // =============================
// Shared Item Card (clickable)
// =============================
const renderItemCard = (item, index) => (
  <div
    key={index}
    className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition w-full cursor-pointer"
    onClick={() => navigate(`/product/${item.product._id}?from=dashboard`)}
  >
    <img
      src={item.product.image}
      alt={item.product.title}
      className="w-full h-32 object-contain mb-2"
    />
    <h3 className="font-semibold text-md line-clamp-1">{item.product.title}</h3>
    <p className="text-red-600 font-bold mt-1">₹{item.product.price}</p>
    {item.qty && <p className="text-sm text-gray-500 mt-1">Qty: {item.qty}</p>}

    {/* Buy button (works for dashboard too) */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleBuy(item); // ✅ opens Stripe modal
      }}
      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
    >
      Buy Now
    </button>

    {/* Remove buttons */}
    {activeTab === "cart" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveCartItem(item._id);
        }}
        className="mt-2 w-full bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 text-sm"
      >
        Remove
      </button>
    )}

    {activeTab === "wishlist" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveWishlistItem(item.product._id);
        }}
        className="mt-2 w-full bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 text-sm"
      >
        Remove
      </button>
    )}
  </div>
);


  // =============================
  // Filtered Items
  // =============================
  const filteredCart = cart.filter((item) =>
    item.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWishlist = wishlist.filter((item) =>
    item.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ⬅ Back to Home
          </button>
          <h1 className="text-3xl font-bold flex-1 text-center -translate-x-2">
            🛒 Customer Dashboard
          </h1>
          <div></div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-6 mb-10">
          <button onClick={() => setActiveTab("cart")} className={tabClass("cart")}>
            🛍 Cart
          </button>
          <button onClick={() => setActiveTab("wishlist")} className={tabClass("wishlist")}>
            ❤️ Wishlist
          </button>
          <button onClick={() => setActiveTab("orders")} className={tabClass("orders")}>
            📦 Orders
          </button>
        </div>

        {/* SEARCH INPUT */}
        {(activeTab === "cart" || activeTab === "wishlist") && (
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />
        )}

        {/* CART TAB */}
        {activeTab === "cart" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🛍 My Cart</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Clear All
                </button>
              )}
            </div>
            {filteredCart.length === 0 && <p className="text-gray-500">No items found</p>}
            <div className="grid sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto justify-items-center">
              {filteredCart.map((item) => renderItemCard(item, "cart"))}
            </div>
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlist" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">❤️ My Wishlist</h2>
              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Clear All
                </button>
              )}
            </div>
            {filteredWishlist.length === 0 && <p className="text-gray-500">No items found</p>}
            <div className="grid sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto justify-items-center">
              {filteredWishlist.map((item) => renderItemCard(item, "wishlist"))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-8 border-b pb-4">📦 My Orders</h2>
            {orders.length === 0 && <p className="text-gray-500">No orders yet</p>}

            <div className="space-y-6">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-6 border rounded-xl p-5 hover:shadow-md transition"
                >
                  <img
                    src={order.product.image}
                    alt={order.product.title}
                    className="w-32 h-32 object-contain bg-gray-50 rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.product.title}</h3>
                    <p className="text-red-600 font-bold text-lg">₹{order.product.price}</p>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>Qty: {order.qty}</p>
                      <p>Payment: {order.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-start md:items-center">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-xl w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
              <div className="space-y-4">
                <input
                  placeholder="Full Name"
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  placeholder="Address"
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                />
                <input
                  placeholder="City"
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <input
                  placeholder="Pincode"
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
                <input
                  placeholder="Phone"
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <button
                  onClick={placeOrder}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
                >
                  Confirm & Pay
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full border py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

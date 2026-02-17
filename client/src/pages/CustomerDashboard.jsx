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

  // ✅ SHIPPING FORM STATE
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const cartRes = await fetch(`${API_URL}/api/user/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cartData = await cartRes.json();
        setCart(cartData.reverse());

        const wishRes = await fetch(`${API_URL}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const wishData = await wishRes.json();
        setWishlist(
          wishData.map((item) => ({ product: item, qty: 1 })).reverse()
        );

        const orderRes = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const orderData = await orderRes.json();
        setOrders(orderData.reverse());
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  // ================= REMOVE =================
  const removeCartItem = async (productId) => {
    await fetch(`${API_URL}/api/user/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setCart((prev) =>
      prev.filter((item) => item.product?._id !== productId)
    );
  };

  const removeWishlistItem = async (productId) => {
    await fetch(`${API_URL}/api/user/wishlist/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setWishlist((prev) =>
      prev.filter((item) => item.product?._id !== productId)
    );
  };

  const clearCart = async () => {
    await fetch(`${API_URL}/api/user/cart-clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setCart([]);
  };

  const clearWishlist = async () => {
    await fetch(`${API_URL}/api/user/wishlist-clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setWishlist([]);
  };

  // ================= BUY =================
  const handleBuy = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const placeOrder = async () => {
    if (!selectedItem) return;

    if (
      !shipping.name ||
      !shipping.phone ||
      !shipping.address ||
      !shipping.city ||
      !shipping.pincode
    ) {
      alert("Please fill all shipping details");
      return;
    }

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
          shippingAddress: shipping,
        }),
      }
    );

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Payment session failed");
    }
  };

  // ================= FILTER =================
  const filteredCart = cart.filter(
    (item) =>
      item?.product?.title &&
      item.product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredWishlist = wishlist.filter(
    (item) =>
      item?.product?.title &&
      item.product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const tabClass = (tab) =>
    `px-6 py-2 rounded-full font-semibold ${
      activeTab === tab ? "bg-black text-white" : "bg-white shadow"
    }`;

  // ================= ITEM CARD =================
  const renderItemCard = (item) => (
    <div
      className="bg-white border rounded-lg p-3 shadow hover:shadow-md cursor-pointer"
      onClick={() =>
        navigate(`/product/${item.product._id}?from=dashboard`)
      }
    >
      <img
        src={item.product.image}
        alt={item.product.title}
        className="w-full h-32 object-contain"
      />

      <h3 className="font-semibold mt-2 line-clamp-1">
        {item.product.title}
      </h3>

      <p className="text-red-600 font-bold">
        ₹{item.product.price}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleBuy(item);
        }}
        className="w-full mt-2 bg-green-600 text-white py-2 rounded"
      >
        Buy Now
      </button>

      {activeTab === "cart" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCartItem(item.product._id);
          }}
          className="w-full mt-2 bg-red-500 text-white py-1 rounded"
        >
          Remove
        </button>
      )}

      {activeTab === "wishlist" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeWishlistItem(item.product._id);
          }}
          className="w-full mt-2 bg-red-500 text-white py-1 rounded"
        >
          Remove
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            ⬅ Back
          </button>

          <h1 className="text-3xl font-bold">
            Customer Dashboard
          </h1>

          <div />
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => setActiveTab("cart")} className={tabClass("cart")}>Cart</button>
          <button onClick={() => setActiveTab("wishlist")} className={tabClass("wishlist")}>Wishlist</button>
          <button onClick={() => setActiveTab("orders")} className={tabClass("orders")}>Orders</button>
        </div>

        {/* SEARCH */}
        {(activeTab === "cart" || activeTab === "wishlist") && (
          <input
            className="w-full border p-3 rounded mb-4"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}

        {/* CART */}
        {activeTab === "cart" && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-xl">My Cart</h2>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {filteredCart.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-xl">My Wishlist</h2>

              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {filteredWishlist.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-bold text-xl mb-6">My Orders</h2>

            {orders.length === 0 && (
              <p className="text-gray-500">No orders yet</p>
            )}

            {orders.map((order) => (
              <div
                key={order._id}
                className="flex gap-6 border p-4 rounded-lg mb-4"
              >
                <img
                  src={order.product?.image}
                  alt={order.product?.title}
                  className="w-28 h-28 object-contain bg-gray-50 rounded"
                />

                <div>
                  <h3 className="font-semibold">
                    {order.product?.title}
                  </h3>

                  <p className="text-red-600 font-bold">
                    ₹{order.product?.price}
                  </p>

                  <p>Qty: {order.qty}</p>
                  <p>Status: {order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SHIPPING MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-lg font-bold mb-4">
                Shipping Details
              </h2>

              <input
                placeholder="Full Name"
                className="w-full border p-2 mb-2 rounded"
                onChange={(e) =>
                  setShipping({ ...shipping, name: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                className="w-full border p-2 mb-2 rounded"
                onChange={(e) =>
                  setShipping({ ...shipping, phone: e.target.value })
                }
              />

              <input
                placeholder="Address"
                className="w-full border p-2 mb-2 rounded"
                onChange={(e) =>
                  setShipping({ ...shipping, address: e.target.value })
                }
              />

              <input
                placeholder="City"
                className="w-full border p-2 mb-2 rounded"
                onChange={(e) =>
                  setShipping({ ...shipping, city: e.target.value })
                }
              />

              <input
                placeholder="Pincode"
                className="w-full border p-2 mb-3 rounded"
                onChange={(e) =>
                  setShipping({ ...shipping, pincode: e.target.value })
                }
              />

              <button
                onClick={placeOrder}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Proceed to Payment
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-2 bg-gray-400 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDashboard;

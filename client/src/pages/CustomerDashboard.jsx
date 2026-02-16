import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

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
  // Fetch Cart + Wishlist + Orders
  // =============================
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // CART
       const cartRes = await fetch(
    `${API_URL}/api/user/cart`
,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

        const cartData = await cartRes.json();
        setCart(cartData);

        // WISHLIST
       const wishRes = await fetch(
  `${API_URL}/api/user/wishlist`
,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

        const wishData = await wishRes.json();

        const formattedWishlist = wishData.map((item) => ({
          product: item,
          qty: 1,
        }));

        setWishlist(formattedWishlist);

        // MY ORDERS
      const orderRes = await fetch(
  `${API_URL}/api/orders/my-orders`
,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);


        const orderData = await orderRes.json();
        setOrders(orderData);

      } catch (error) {
        console.log("Fetch error:", error);
      }
    };

    fetchData();
  }, []);

  // =============================
  // Open Modal
  // =============================
  const handleBuy = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // =============================
  // Stripe Checkout
  // =============================
  const placeOrder = async () => {
    try {
      if (!selectedItem) return;

    const res = await fetch(
 `${API_URL}/api/orders/create-checkout-session`
,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      productId: selectedItem.product._id,
      qty: selectedItem.qty,
      shippingAddress: formData,
    }),
  }
);


      const data = await res.json();

      window.location.href = data.url;
    } catch (error) {
      console.log("Payment error:", error);
    }
  };

  // =============================
  // Shared Card UI
  // =============================
  const renderItemCard = (item, index) => (
    <div key={index} className="flex gap-6 border-b py-5">
      <img
        src={item.product.image}
        alt={item.product.title}
        className="w-28 h-28 object-contain"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-lg">
          {item.product.title}
        </h3>

        <p className="text-red-600 font-bold">
          ₹{item.product.price}
        </p>

        {item.qty && <p>Qty: {item.qty}</p>}

        <button
          onClick={() => handleBuy(item)}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Buy Now
        </button>
      </div>
    </div>
  );

return (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-10 text-center">
      🛒 Customer Dashboard
    </h1>

    {/* ================= CART + WISHLIST GRID ================= */}
    <div className="grid md:grid-cols-2 gap-8">

      {/* CART */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-6 border-b pb-3">
          🛍 My Cart
        </h2>

        {cart.length === 0 && (
          <p className="text-gray-500">No items in cart</p>
        )}

        <div className="space-y-5 max-h-[500px] overflow-y-auto">
          {cart.map(renderItemCard)}
        </div>
      </div>

      {/* WISHLIST */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-6 border-b pb-3">
          ❤️ My Wishlist
        </h2>

        {wishlist.length === 0 && (
          <p className="text-gray-500">No items in wishlist</p>
        )}

        <div className="space-y-5 max-h-[500px] overflow-y-auto">
          {wishlist.map(renderItemCard)}
        </div>
      </div>
    </div>

    {/* ================= ORDERS ================= */}
    <div className="bg-white p-8 rounded-2xl shadow-lg mt-12">
      <h2 className="text-2xl font-bold mb-8 border-b pb-4">
        📦 My Orders
      </h2>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders yet</p>
      )}

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
              <h3 className="font-semibold text-lg">
                {order.product.title}
              </h3>

              <p className="text-red-600 font-bold text-lg">
                ₹{order.product.price}
              </p>

              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>Qty: {order.qty}</p>
                <p>Payment: {order.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-start md:items-center">
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold
                ${
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

    {/* ================= MODAL (UNCHANGED) ================= */}
    {showModal && selectedItem && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">
            Delivery Details
          </h2>

          <div className="space-y-4">
            <input
              placeholder="Full Name"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              placeholder="Address"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  addressLine: e.target.value,
                })
              }
            />

            <input
              placeholder="City"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />

            <input
              placeholder="Pincode"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pincode: e.target.value,
                })
              }
            />

            <input
              placeholder="Phone"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
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
);

};

export default CustomerDashboard;

import { useEffect, useState } from "react";
import { API_URL } from "../config";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOrders(data);
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="border p-3 mb-3 rounded"
          >
            <h3 className="font-semibold">
              {order.product?.title}
            </h3>
            <p>Qty: {order.qty}</p>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentMethod}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;

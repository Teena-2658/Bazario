import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
const [visitData, setVisitData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats");
      const usersRes = await axios.get("http://localhost:5000/api/admin/users");
      const productsRes = await axios.get("http://localhost:5000/api/products");
const visitRes = await axios.get("http://localhost:5000/api/visits/all");
setVisitData(visitRes.data);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const vendors = users.filter((user) => user.role === "vendor");
  const customers = users.filter((user) => user.role === "customer");

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-xl p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-10">
          Admin Panel
        </h2>

        <ul className="space-y-4">
          {["dashboard", "products", "vendors", "customers"].map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer capitalize p-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        {/* DASHBOARD */}
       {activeTab === "dashboard" && (
  <>
    <h1 className="text-3xl font-bold mb-8">
      Dashboard Overview
    </h1>

    {/* STATS CARDS */}
    <div className="grid grid-cols-3 gap-6 mb-10">
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Total Products" value={stats.totalProducts} />
      <StatCard title="Total Orders" value={stats.totalOrders} />
    </div>

    {/* VISITOR GRAPH */}
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
      <h2 className="text-xl font-semibold mb-6">
        Website Visitors (Daily)
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={visitData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </>
)}
        {/* PRODUCTS */}
        {activeTab === "products" && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              All Products
            </h2>

            <div className="grid grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:bg-gray-50 transition duration-300 overflow-hidden group"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-blue-600 transition">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {product.category}
                    </p>
                    <p className="font-bold mt-2 text-lg">
                      ₹ {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VENDORS */}
        {activeTab === "vendors" && (
          <UserCards
            title="All Vendors"
            users={vendors}
            onDelete={deleteUser}
          />
        )}

        {/* CUSTOMERS */}
        {activeTab === "customers" && (
          <UserCards
            title="All Customers"
            users={customers}
            onDelete={deleteUser}
          />
        )}

      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:bg-blue-50">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold mt-2">
      {value || 0}
    </h2>
  </div>
);

// 🔥 USERS IN CARD STYLE
const UserCards = ({ title, users, onDelete }) => (
  <>
    <h2 className="text-2xl font-bold mb-6">{title}</h2>

    <div className="grid grid-cols-3 gap-6">
      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 hover:bg-blue-50 group"
        >
          <h3 className="text-lg font-semibold group-hover:text-blue-600 transition">
            {user.name}
          </h3>

          <p className="text-gray-500 text-sm mt-1">
            {user.email}
          </p>

          <button
            onClick={() => onDelete(user._id)}
            className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </>
);

export default AdminDashboard;
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, productsRes, visitRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`),
        axios.get(`${API_URL}/api/admin/users`),
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/visits/all`),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setVisitData(visitDataFormatter(visitRes.data)); // optional: better date format
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Optional helper – make dates nicer for chart (DD-MM)
  const visitDataFormatter = (data) =>
    data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/delete/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Could not delete user");
    }
  };

  const vendors = users.filter((u) => u.role === "vendor");
  const customers = users.filter((u) => u.role === "customer");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:block w-72 bg-white border-r shadow-sm">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-indigo-700 mb-10">
            Admin Panel
          </h2>
         {["dashboard", "products", "reviewAnalytics", "vendors", "customers"].map((tab) => ( 
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`block w-full text-left px-5 py-3.5 rounded-xl mb-3 text-lg font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  Dashboard Overview
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <StatCard title="Total Users" value={stats.totalUsers ?? 0} color="indigo" />
                  <StatCard title="Total Products" value={stats.totalProducts ?? 0} color="blue" />
                  <StatCard title="Total Orders" value={stats.totalOrders ?? 0} color="green" />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Daily Visitors Trend
                  </h2>
                  <div className="h-80 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === "products" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  All Products
                </h1>
                {products.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <p className="text-xl">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>
                )}
              </>
            )}
{activeTab === "reviewAnalytics" && (
  <>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
      Product Review Analytics
    </h1>

    {products.filter((p) => (p.totalReviews || 0) > 0).length === 0 ? (
      <p className="text-gray-500 text-lg">
        No reviewed products found
      </p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products
          .filter((product) => (product.totalReviews || 0) > 0)
          .map((product) => {
            const total = product.totalReviews || 0;
            const good = product.goodCount || 0;
            const bad = product.badCount || 0;

            const goodPercent =
              total > 0 ? Math.round((good / total) * 100) : 0;

            const badPercent =
              total > 0 ? Math.round((bad / total) * 100) : 0;

            return (
              <div
                key={product._id}
                className="bg-white p-5 rounded-2xl shadow border"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-40 w-full object-cover rounded-lg"
                />

                <h3 className="mt-3 font-semibold text-lg">
                  {product.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  ⭐ {product.averageRating?.toFixed(1) || 0} (
                  {total} reviews)
                </p>

                <div className="mt-4 space-y-3">

                  {/* 👍 Good Bar (show only if > 0) */}
                  {good > 0 && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">👍 Good</span>
                        <span>
                          {good} ({goodPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: `${goodPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* 👎 Bad Bar (show only if > 0) */}
                  {bad > 0 && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500">👎 Bad</span>
                        <span>
                          {bad} ({badPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded">
                        <div
                          className="bg-red-500 h-2 rounded"
                          style={{ width: `${badPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
      </div>
    )}
  </>
)}
            {(activeTab === "vendors" || activeTab === "customers") && (
              <UserList
                title={activeTab === "vendors" ? "Vendors" : "Customers"}
                users={activeTab === "vendors" ? vendors : customers}
                onDelete={deleteUser}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

// ──────────────────────────────────────────────
// Reusable Components
// ──────────────────────────────────────────────

const StatCard = ({ title, value, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className={`p-6 rounded-2xl shadow-md ${colors[color] || "bg-gray-50"}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-4xl font-bold mt-3">{value.toLocaleString()}</p>
    </div>
  );
};

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
    <div className="relative h-52 overflow-hidden">
      <img
        src={product.image || "https://via.placeholder.com/400x300?text=No+Image"}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=Product";
        }}
      />
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
        {product.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{product.category || "—"}</p>
      <p className="text-xl font-bold text-indigo-700 mt-3">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>
    </div>
  </div>
);

const UserList = ({ title, users, onDelete }) => (
  <div>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
      {title} ({users.length})
    </h1>

    {users.length === 0 ? (
      <div className="text-center py-16 text-gray-500">
        <p className="text-xl">No {title.toLowerCase()} registered yet</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <img
                src={
                  user.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || user.email.split("@")[0]
                  )}&background=4f46e5&color=fff&size=128`
                }
                alt={user.name || "User"}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=?&background=ccc&color=000";
                }}
              />
              <h3 className="font-semibold text-xl text-gray-900">
                {user.name || "No Name"}
              </h3>
              <p className="text-sm text-gray-600 mt-1 break-all">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500 mt-1">+91 {user.phone}</p>
              )}
            </div>

            <div className="p-5 flex justify-center">
              <button
                onClick={() => onDelete(user._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminDashboard;
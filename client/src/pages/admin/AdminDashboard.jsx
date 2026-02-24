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
      const [statsRes, usersRes, productsRes, visitRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/admin/stats`),
          axios.get(`${API_URL}/api/admin/users`),
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/visits/all`),
        ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setVisitData(visitRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-indigo-700 mb-10">
            Admin Panel
          </h2>
          {["dashboard", "products", "vendors", "customers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`block w-full text-left px-4 py-3 rounded-lg mb-2 ${
                activeTab === tab
                  ? "bg-indigo-100 text-indigo-700"
                  : "hover:bg-slate-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-8">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <>
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <StatCard title="Total Users" value={stats.totalUsers ?? 0} />
                  <StatCard
                    title="Total Products"
                    value={stats.totalProducts ?? 0}
                  />
                  <StatCard
                    title="Total Orders"
                    value={stats.totalOrders ?? 0}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    Daily Visitors
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#4f46e5"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === "products" && (
              <>
                <h1 className="text-3xl font-bold mb-6">Products</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white rounded-xl shadow p-4"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-48 object-cover rounded"
                      />
                      <h3 className="font-semibold mt-3">{p.title}</h3>
                      <p className="text-sm text-gray-500">{p.category}</p>
                      <p className="font-bold mt-2">
                        ₹{Number(p.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(activeTab === "vendors" || activeTab === "customers") && (
              <UserCards
                title={activeTab === "vendors" ? "Vendors" : "Customers"}
                users={
                  activeTab === "vendors" ? vendors : customers
                }
                onDelete={deleteUser}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const UserCards = ({ title, users, onDelete }) => (
  <div>
    <h1 className="text-3xl font-bold mb-6">{title}</h1>
    {users.length === 0 ? (
      <p>No {title} found</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <button
              onClick={() => onDelete(user._id)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminDashboard;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, productsRes, visitRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats"),
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/visits/all"),
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
      await axios.delete(`http://localhost:5000/api/admin/delete/${id}`);
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
      {/* Sidebar */}
      <aside className="hidden md:block w-72 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-indigo-700 tracking-tight mb-12">
            Admin Panel
          </h2>
          <nav className="space-y-1.5">
            {["dashboard", "products", "vendors", "customers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar (simple tabs) */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex overflow-x-auto gap-3">
        {["dashboard", "products", "vendors", "customers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="space-y-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                  Dashboard
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard title="Total Users" value={stats.totalUsers ?? 0} />
                  <StatCard title="Total Products" value={stats.totalProducts ?? 0} />
                  <StatCard title="Total Orders" value={stats.totalOrders ?? 0} />
                </div>

                <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 lg:p-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Daily Visitors
                  </h2>
                  <div className="h-72 sm:h-80">
                    <ResponsiveContainer>
                      <LineChart data={visitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={13} />
                        <YAxis stroke="#64748b" fontSize={13} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                  Products
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="aspect-[4/3] bg-slate-100">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=No+Image")}
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg line-clamp-2">{p.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{p.category}</p>
                        <p className="mt-3 font-bold text-xl text-slate-900">
                          ₹{Number(p.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === "vendors" || activeTab === "customers") && (
              <UserCards
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

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow transition-shadow">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
  </div>
);

const UserCards = ({ title, users, onDelete }) => (
  <div className="space-y-8">
    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
      {title}
    </h1>

    {users.length === 0 ? (
      <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
        No {title.toLowerCase()} found
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => {
          const profile = user.profile || {};
          const isVendor = user.role === "vendor";
          const name = user.name || profile.name || "Unknown";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={user._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 group flex flex-col"
            >
              {/* Gradient header + floating avatar */}
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md absolute -bottom-14 left-1/2 -translate-x-1/2 ring-2 ring-indigo-200/60 transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d8abc&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-md border-4 border-white absolute -bottom-14 left-1/2 -translate-x-1/2 ring-2 ring-indigo-200/60 group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                )}
              </div>

              <div className="pt-20 pb-8 px-6 text-center flex flex-col flex-1">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {name}
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-6 break-all">{user.email}</p>

                <div className="text-left space-y-2.5 text-sm text-slate-600 flex-1">
                  {profile.phone && (
                    <div>
                      <span className="font-medium text-slate-700">Phone:</span> {profile.phone}
                    </div>
                  )}

                  {isVendor && profile.shopName && (
                    <div>
                      <span className="font-medium text-slate-700">Shop:</span> {profile.shopName}
                    </div>
                  )}

                  {(profile.city || profile.state) && (
                    <div>
                      <span className="font-medium text-slate-700">Location:</span>{" "}
                      {[profile.city, profile.state].filter(Boolean).join(", ")}
                    </div>
                  )}

                  {profile.createdAt && (
                    <div className="text-slate-500 text-xs mt-4">
                      Joined {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => onDelete(user._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2.5 rounded-lg transition border border-red-200"
                  >
                    Delete
                  </button>
                 
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default AdminDashboard;
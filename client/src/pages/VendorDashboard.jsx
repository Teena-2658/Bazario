import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  // const vendorId = storedUser?._id || null;
  // const token = localStorage.getItem("token") || "";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]); // New: dedicated state for customers
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    image: "",
    category: "",
    section: "spotlight",
    status: "active",
  });

  const [profile, setProfile] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: "",
    city: "",
    address: "",
    image: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [vendorId, setVendorId] = useState(null);
const [token, setToken] = useState("");

useEffect(() => {
  // console.log("Reading localStorage...");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const savedToken = user.token || "";


  console.log("User:", user);
  console.log("Token:", savedToken);

  setVendorId(user?._id || null);
  setToken(savedToken || "");
}, []);

  // Load products for vendor
  const loadProducts = async () => {
    console.log("products loaded:");
  if (!vendorId) return;
  try {
    const res = await fetch(`${API_URL}/api/products/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
  }
};
const startEdit = (product) => {
  setEditingProductId(product._id);
  
  // left side wale form ko product ke data se bhar do
  setForm({
    title: product.title || "",
    price: product.price || "",
    description: product.description || "",
    image: product.image || "",
    category: product.category || "",
    section: product.section || "spotlight",
    status: product.status || "active",
  });
};
  // Load profile
  const loadProfile = async () => {
    console.log("profile loaded:");
    if (!vendorId) return;
    try {
      const res = await fetch(`${API_URL}/api/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || storedUser.name || "",
          email: data.email || storedUser.email || "",
          phone: data.phone || "",
          city: data.city || "",
          address: data.address || "",
          image: data.image || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };
  
  // Load customers (main fix - separate API call)
 const loadCustomers = async () => {
  if (!vendorId || !token) {
    setCustomers([]);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/orders/vendor-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.log("Vendor orders API failed:", res.status, await res.text());
      setCustomers([]);
      return;
    }

    const orders = await res.json();
    console.log("Raw vendor orders:", orders);

    // Group orders by customer (user._id)
    const customerMap = new Map();

    orders.forEach((order) => {
      const user = order.user;
      if (!user?._id) return;

      const userId = user._id;

      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          _id: userId,
          name: user.name || "Unknown",
          email: user.email || "—",
          phone: user.phone || "—",
          products: [],
          lastOrderDate: order.createdAt,
          orderCount: 0,
        });
      }

      const cust = customerMap.get(userId);

      // Add product info to this customer's list
      cust.products.push({
        title: order.product?.title || "Product",
        price: order.price || order.product?.price * order.qty,
        qty: order.qty,
        orderedAt: order.createdAt,
      });

      cust.orderCount += 1;

      // Update last order date if newer
      if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = order.createdAt;
      }
    });

    const uniqueCustomers = Array.from(customerMap.values());
    console.log("Processed unique customers:", uniqueCustomers);

    setCustomers(uniqueCustomers);
  } catch (err) {
    console.error("Error loading customers from orders:", err);
    setCustomers([]);
  }
};

  // useEffect(() => {
  //   if (vendorId && token) {
  //     setLoading(true);
  //     loadProducts();
  //     loadProfile();
  //     loadCustomers(); // Customers tab ke liye fresh load
  //     setLoading(false);
  //   }
  // }, [vendorId, activeTab]); // Tab change pe reload (customers tab pe zaruri)

useEffect(() => {
  const loadAllData = async () => {
    if (!vendorId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await Promise.all([
      loadProducts(),
      loadProfile(),
      loadCustomers(),
    ]);
    setLoading(false);
  };

  loadAllData();
}, [vendorId, token, activeTab]);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let url = `${API_URL}/api/products/add`;
    let method = "POST";

    // 🔥 If editing → use PUT
    if (editingProductId) {
      url = `${API_URL}/api/products/${editingProductId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, vendorId }),
    });

    if (res.ok) {
      alert(editingProductId ? "Product Updated ✅" : "Product Added ✅");

      setForm({
        title: "",
        price: "",
        description: "",
        image: "",
        category: "",
        section: "spotlight",
        status: "active",
      });

      setEditingProductId(null);
      loadProducts();
    } else {
      const errText = await res.text();
      alert("Failed: " + errText);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
};

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadProducts();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/vendors/${vendorId}`, {
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
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = products.filter((p) => p.status === "active").length;
  const stockCount = products.filter((p) => p.status === "outofstock").length;

  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * 3, 0);

  const chartData = [
    { name: "Active", value: activeCount },
    { name: "Out Of Stock", value: stockCount },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-xl p-6 space-y-5 fixed h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800">Vendor Panel</h2>
        {["dashboard", "profile", "products", "customers", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`block w-full text-left p-3 rounded-lg transition ${
              activeTab === tab ? "bg-blue-600 text-white font-semibold" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab === "customers" ? "Customers" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
    onClick={() => navigate("/")}
    className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-gray-700 transition"
  >
    ← Back to Home
  </button>
       
      </div>

      <div className="flex-1 ml-64">
        {/* HEADER */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <img
              src={
                profile.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Vendor")}&background=0D8ABC&color=fff&size=128`
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm"
              onError={(e) => (e.target.src = "https://ui-avatars.com/api/?name=Vendor&background=ccc&color=000")}
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Hi, {profile.name || storedUser.name || "Vendor"}!
              </h1>
              <p className="text-sm text-gray-500">Bazario Vendor Dashboard</p>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {loading && <div className="text-center py-10 text-xl">Loading dashboard...</div>}

          {activeTab === "dashboard" && (
            <>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-4xl font-bold text-blue-600">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-4xl font-bold text-green-600">{activeCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-4xl font-bold text-red-600">{stockCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <p className="text-sm text-gray-500">Est. Revenue</p>
                  <p className="text-4xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Product Status</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-4">All Products</h3>
                  {products.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {products.map((p) => (
                        <div key={p._id} className="flex items-center space-x-4 border-b pb-3 last:border-0">
                          <img src={p.image || "https://via.placeholder.com/64"} alt={p.title} className="w-16 h-16 object-cover rounded-md" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{p.title}</p>
                            <p className="text-sm text-gray-600">₹{p.price} • {p.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-12">No products added yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Vendor Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="flex justify-center">
                    <img
                      src={
                        profile.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Vendor")}&background=random&color=fff&size=160`
                      }
                      alt="Preview"
                      className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/160?text=Invalid")}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        className="w-full border p-3 rounded-lg"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full border p-3 rounded-lg"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        className="w-full border p-3 rounded-lg"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        className="w-full border p-3 rounded-lg"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      className="w-full border p-3 rounded-lg"
                      rows="3"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                    <input
                      className="w-full border p-3 rounded-lg"
                      placeholder="https://..."
                      value={profile.image}
                      onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8 text-center md:text-left">
                  <div className="flex justify-center">
                    <img
                      src={
                        profile.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Vendor")}&background=random&color=fff&size=200`
                      }
                      alt="Profile"
                      className="w-56 h-56 rounded-full object-cover border-4 border-blue-100 shadow-2xl"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/200?text=No+Image")}
                    />
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-gray-800">
                      {profile.name || "Your Name"}
                    </h3>
                    <p className="text-xl text-gray-600 mt-2">
                      {profile.email || "Email not set"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-8 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500 uppercase">Phone</p>
                      <p className="text-2xl font-medium">{profile.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase">City</p>
                      <p className="text-2xl font-medium">{profile.city || "—"}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-500 uppercase">Address</p>
                      <p className="text-2xl font-medium">{profile.address || "No address added"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="h-[calc(100vh-140px)] flex gap-8">
              <div className="w-1/3 bg-white p-6 rounded-xl shadow-md sticky top-4 h-fit">
                <h3 className="text-xl font-semibold mb-6">Add New Product</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    className="w-full border p-3 rounded-lg"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <input
                    type="number"
                    className="w-full border p-3 rounded-lg"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                  <textarea
                    className="w-full border p-3 rounded-lg"
                    rows="4"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <input
                    className="w-full border p-3 rounded-lg"
                    placeholder="Image URL"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <input
                    className="w-full border p-3 rounded-lg"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                  <select
                    className="w-full border p-3 rounded-lg"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                  >
                    <option value="spotlight">Spotlight</option>
                    <option value="trending">Trending</option>
                    <option value="indemand">In Demand</option>
                    <option value="everybody">Everybody</option>
                  </select>
                  <select
                    className="w-full border p-3 rounded-lg"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="outofstock">Out Of Stock</option>
                  </select>
                 <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
  {editingProductId ? "Update Product" : "Add Product"}
</button>
                </form>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-5 rounded-xl shadow-md">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-6 rounded-xl shadow-md">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center text-gray-500 py-20">No products found</div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p._id}
                          className="bg-gray-50 rounded-xl shadow hover:shadow-xl transition flex flex-col"
                        >
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-48 w-full object-cover rounded-t-xl"
                          />
                          <div className="p-5 flex flex-col flex-1">
                            <h4 className="font-semibold text-lg mb-2">{p.title}</h4>
                            <p className="text-sm text-gray-600 flex-1">{p.description}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-blue-600 font-bold text-xl">₹{p.price}</span>
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${
                                  p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            
                          <div className="mt-4 flex gap-3">
  <button
    onClick={() => startEdit(p)}
    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
  >
    Edit
  </button>
  
  <button
    onClick={() => deleteProduct(p._id)}
    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
  >
    Delete
  </button>
</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
  <div className="space-y-8">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        My Customers
      </h1>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-sm font-medium text-indigo-700 border border-indigo-100">
        <span className="font-bold">{customers.length}</span>
        <span>unique {customers.length === 1 ? "customer" : "customers"}</span>
      </div>
    </div>

    {/* Content */}
    {customers.length === 0 ? (
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-12 text-center shadow-inner">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">No customers yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
         Hey, if any customer buy your product then they will appear here with their details.
        </p>
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((cust) => (
          <div
            key={cust._id || cust.email}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300 flex flex-col group max-h-[520px]"
          >
            {/* Top - Identity */}
            <div className="p-6 pb-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/40 border-b border-indigo-100/60">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                {cust.name || "Customer"}
              </h3>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {cust.email || "—"}
              </p>

              {cust.phone && cust.phone !== "—" && (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {cust.phone}
                </div>
              )}
            </div>

            {/* Middle - All Orders (no slice, full list + scroll) */}
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h4 className="text-base font-semibold text-gray-800">Purchased Items</h4>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {cust.orderCount} order{cust.orderCount > 1 ? 's' : ''}
                </span>
              </div>

              {cust.products?.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
                  <ul className="space-y-3.5">
                    {cust.products.map((prod, i) => (
                      <li 
                        key={i}
                        className="flex justify-between items-start gap-3 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {prod.title || "Product"}
                          </p>
                          {prod.qty && prod.qty > 1 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Qty: {prod.qty}
                            </p>
                          )}
                        </div>
                        {prod.price && (
                          <span className="font-semibold text-gray-900 whitespace-nowrap text-right">
                            ₹{Number(prod.price).toLocaleString("en-IN")}
                            {prod.qty && prod.qty > 1 && (
                              <span className="text-xs text-gray-600 block">
                                total
                              </span>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-6">
                  No detailed product information available
                </p>
              )}
            </div>

            {/* Bottom - Last Order */}
            {cust.lastOrderDate && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 text-sm flex justify-between items-center text-gray-700 font-medium">
                <span>Last ordered on</span>
                <time className="text-indigo-700">
                  {new Date(cust.lastOrderDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </time>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
          {activeTab === "analytics" && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-8">Analytics Overview</h2>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
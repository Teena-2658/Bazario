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
  const vendorId = storedUser?._id || null;
  const token = localStorage.getItem("token") || "";

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

  // Load products for vendor
  const loadProducts = async () => {
    if (!vendorId) return;
    try {
      const res = await fetch(`${API_URL}/api/products/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Products load error:", err);
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
      const res = await fetch(`${API_URL}/api/vendor/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        console.log("Customers API failed:", res.status);
        const text = await res.text();
        console.log("Response text:", text);
        setCustomers([]);
      }
    } catch (err) {
      console.error("Customers load error:", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    if (vendorId && token) {
      setLoading(true);
      loadProducts();
      loadProfile();
      loadCustomers(); // Customers tab ke liye fresh load
      setLoading(false);
    }
  }, [vendorId, activeTab]); // Tab change pe reload (customers tab pe zaruri)

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
          className="mt-10 w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
        >
          Logout
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
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">My Customers</h1>
              <p className="text-gray-600 mb-8">
              
                {customers.length > 0 && (
                  <span className="ml-2 text-blue-600">({customers.length} unique customers)</span>
                )}
              </p>

              {customers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-xl">No customers yet</p>
                  <p className="mt-2 text-gray-400">
                  
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map((cust) => (
                    <div
                      key={cust._id || cust.email}
                      className="border rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition shadow-sm"
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {cust.name || "Customer"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cust.email || "Email not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                        
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {cust.products && cust.products.length > 0 ? (
                            cust.products.map((prod, i) => (
                              <li key={i}>
                                {prod.title || prod.name || "Product"} 
                                {prod.price ? ` - ₹${prod.price}` : ""}
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500 italic">No product details available</li>
                          )}
                        </ul>
                      </div>

                      {cust.lastOrderDate && (
                        <p className="text-xs text-gray-500 mt-4">
                          Last order: {new Date(cust.lastOrderDate).toLocaleDateString("en-IN")}
                        </p>
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
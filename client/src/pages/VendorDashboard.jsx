import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom"; // ✅ added

const VendorDashboard = () => {

  const navigate = useNavigate(); // ✅ added

  const user = JSON.parse(localStorage.getItem("user"));
  const vendorId = user?._id;

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    image: "",
    category: "",
    section: "spotlight",
  });

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ================= LOAD PRODUCTS =================
  const loadProducts = async () => {
    if (!vendorId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/products/vendor/${vendorId}`
      );
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ================= ADD / UPDATE PRODUCT =================
const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Frontend Validation

  if (!form.title.trim()) {
    alert("Title is required");
    return;
  }

  if (!form.price || form.price <= 0) {
    alert("Enter valid price");
    return;
  }

  if (!form.category) {
    alert("Select category");
    return;
  }

  if (!form.image.startsWith("http")) {
    alert("Enter valid image URL");
    return;
  }

  if (form.description.length < 10) {
    alert("Description must be at least 10 characters");
    return;
  }

  try {
    const url = editingId
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products/add`;

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        vendorId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(editingId ? "Product Updated ✅" : "Product Added ✅");

    setForm({
      title: "",
      price: "",
      description: "",
      image: "",
      category: "",
      section: "spotlight",
    });

    setEditingId(null);
    loadProducts();

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};


  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      loadProducts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          {/* ✅ Back Button Added */}
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ⬅ Back to Home
          </button>

          <h1 className="text-3xl font-bold">
            🏪 Vendor Dashboard
          </h1>

          <div className="bg-white px-5 py-2 rounded-xl shadow text-sm">
            Total Products:
            <span className="font-semibold"> {products.length}</span>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ================= FORM SECTION ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">
              <h2 className="text-xl font-semibold mb-5 border-b pb-3">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  placeholder="Product Title"
                  className="w-full border p-3 rounded-lg"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  className="w-full border p-3 rounded-lg"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  required
                />

               <select
  className="w-full border p-3 rounded-lg"
  value={form.category}
  onChange={(e) =>
    setForm({ ...form, category: e.target.value })
  }
  required
>
  <option value="">Select Category</option>
  <option value="mobiles">Mobiles</option>
  <option value="fashion">Fashion</option>
  <option value="electronics">Electronics</option>
  <option value="home">Home</option>
  <option value="sports">Sports</option>
  <option value="furniture">Furniture</option>
  <option value="travel">Travel</option>
  <option value="utensils">Utensils</option>
</select>


                <select
                  className="w-full border p-3 rounded-lg"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                >
                  <option value="spotlight">Spotlight</option>
                  <option value="trending">Trending</option>
                  <option value="indemand">In Demand</option>
                  <option value="everybody">Everybody</option>
                </select>

                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full border p-3 rounded-lg"
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                  required
                />

                <textarea
                  placeholder="Description"
                  rows="4"
                  className="w-full border p-3 rounded-lg"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>

              </form>
            </div>
          </div>

          {/* ================= PRODUCT LIST ================= */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">

              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="bg-gray-50 p-4">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-40 w-full object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {p.title}
                    </h3>

                    <p className="text-green-600 font-bold text-lg">
                      ₹{p.price}
                    </p>

                    <p className="text-sm text-gray-500">
                      {p.category}
                    </p>

                    <div className="flex justify-between mt-4">

                      <button
                        onClick={() => {
                          setForm(p);
                          setEditingId(p._id);
                        }}
                        className="bg-yellow-400 px-4 py-1 rounded-lg text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

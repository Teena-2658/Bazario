import React, { useState, useEffect } from "react";

const VendorDashboard = () => {

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

  // Load Products
  const loadProducts = async () => {
    if (!vendorId) return;

    const res = await fetch(
      `http://localhost:5000/api/products/vendor/${vendorId}`
    );
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Add / Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:5000/api/products/${editingId}`
      : "http://localhost:5000/api/products/add";

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

    if (res.ok) {
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
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
    });

    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Vendor Dashboard
        </h1>

        {/* Product Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Product Title"
              className="border p-2 rounded"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Category"
              className="border p-2 rounded"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              required
            />

            <select
              className="border p-2 rounded"
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
              className="border p-2 rounded col-span-2"
              value={form.image}
              onChange={(e) =>
                setForm({ ...form, image: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description"
              className="border p-2 rounded col-span-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <button
              type="submit"
              className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="grid grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={p.image}
                alt={p.title}
                className="h-40 w-full object-contain mb-3"
              />

              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-green-600 font-bold">₹{p.price}</p>
              <p className="text-sm text-gray-500">{p.category}</p>

              <div className="flex justify-between mt-3">

                <button
                  onClick={() => {
                    setForm(p);
                    setEditingId(p._id);
                  }}
                  className="bg-yellow-400 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VendorDashboard;

import { useEffect, useState } from "react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${API_URL}/api/admin/products`);
      const data = await res.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.title}
              className="h-48 w-full object-cover"
            />

            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2">
                {product.title}
              </h2>

              <p className="text-gray-500 text-sm mb-2">
                {product.category}
              </p>

              <p className="font-bold text-green-600 text-lg">
                ₹ {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
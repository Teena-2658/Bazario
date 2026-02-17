import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";
import { motion } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fromDashboard = new URLSearchParams(location.search).get("from") === "dashboard";

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <h2 className="p-10">Loading...</h2>;
  if (!product) return <h2 className="p-10 text-red-500">Product Not Found</h2>;

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    window.dispatchEvent(new CustomEvent("cartIncrement", { detail: qty }));

    await fetch(`${API_URL}/api/user/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ productId: product._id, qty }),
    });
  };

  // Framer-motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className={`min-h-screen py-10 px-4 ${fromDashboard ? "bg-gray-50" : "bg-gray-100"}`}>
      <div className={`max-w-6xl mx-auto p-8 rounded-xl shadow-lg ${fromDashboard ? "bg-gray-50" : "bg-white"}`}>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 px-4 py-2 rounded-lg font-semibold ${fromDashboard ? "bg-blue-400 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
        >
          ⬅ Back
        </button>

        <motion.div 
          className="grid md:grid-cols-2 gap-10 items-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* LEFT IMAGE */}
          <motion.div 
            className={`rounded-lg p-6 ${fromDashboard ? "bg-white/50 border border-gray-200" : "bg-gray-100"}`}
            variants={imageVariants}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[450px] object-contain cursor-pointer hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

          {/* RIGHT DETAILS */}
          <motion.div className={`${fromDashboard ? "space-y-4" : ""}`} variants={containerVariants}>
            <motion.p className={`text-sm uppercase font-semibold ${fromDashboard ? "text-indigo-600" : "text-green-600"}`} variants={containerVariants}>
              {product.category}
            </motion.p>

            <motion.h1 className={`text-3xl font-bold ${fromDashboard ? "text-indigo-800" : "text-black"}`} variants={containerVariants}>
              {product.title}
            </motion.h1>

            <motion.p className={`text-3xl font-bold mt-2 ${fromDashboard ? "text-indigo-700" : "text-red-600"}`} variants={containerVariants}>
              ₹{product.price}
            </motion.p>

            <motion.p className={`text-gray-600 mt-4 leading-relaxed ${fromDashboard ? "italic text-gray-700" : ""}`} variants={containerVariants}>
              {product.description}
            </motion.p>

            {/* Quantity & Buttons only on Home / normal view */}
            {!fromDashboard && (
              <>
                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleAddToCart}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                  >
                    Add to Cart
                  </button>
                  
                </div>
              </>
            )}

            <p className="text-sm text-gray-500 mt-6">Section: {product.section}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;

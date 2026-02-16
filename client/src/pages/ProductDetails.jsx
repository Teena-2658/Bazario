import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
       const res = await fetch(
  `${API_URL}/api/products/${id}`

);


        if (!res.ok) {
          throw new Error("Product not found");
        }

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

  if (!product)
    return <h2 className="p-10 text-red-500">Product Not Found</h2>;

  // ADD TO CART
  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("cartIncrement", { detail: qty })
    );

  await fetch(
  `${API_URL}/api/user/cart`
,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      productId: product._id,
      qty: qty,
    }),
  }
);

  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT IMAGE */}
          <div className="bg-gray-100 rounded-lg p-6">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[450px] object-contain"
            />
          </div>

          {/* RIGHT DETAILS */}
          <div>
            <p className="text-green-600 text-sm uppercase">
              {product.category}
            </p>

            <h1 className="text-3xl font-bold mt-2">
              {product.title}
            </h1>

            <p className="text-red-600 text-3xl font-bold mt-4">
              ₹{product.price}
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity */}
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

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
              >
                Add to Cart
              </button>

              <button
                onClick={() => navigate("/wishlist")}
                className="border px-8 py-3 rounded-lg"
              >
                Wishlist
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Section: {product.section}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

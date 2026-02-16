import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Heart } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      fetch("http://localhost:5000/api/user/counts", {
        headers: {
          Authorization: `Bearer ${parsedUser.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCartCount(data.cartCount || 0);
          setWishlistCount(data.wishlistCount || 0);
        })
        .catch(() => {
          setCartCount(0);
          setWishlistCount(0);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("vendorId");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <h1
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Bazario
        </h1>

        {/* Search */}
        <div className="w-[45%]">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search for Products..."
              className="bg-transparent outline-none ml-2 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">

          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Signup
              </button>
            </>
          ) : (
            <>
              <span className="font-medium">Hi, {user.name}</span>

              {/* Vendor Dashboard */}
              {user.role === "vendor" && (
                <button
                  onClick={() => navigate("/vendor-dashboard")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Vendor Dashboard
                </button>
              )}

              {/* Customer Dashboard */}
              {user.role === "customer" && (
                <button
                  onClick={() => navigate("/customer-dashboard")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Dashboard
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Logout
              </button>
            </>
          )}

          {/* Wishlist */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/wishlist")}
          >
            <Heart size={22} />
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded-full">
              {wishlistCount}
            </span>
          </div>

          {/* Cart */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded-full">
              {cartCount}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Navbar;

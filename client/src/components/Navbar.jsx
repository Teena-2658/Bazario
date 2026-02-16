import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Heart } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) return navigate("/login");

    if (storedUser.role === "vendor") {
      navigate("/vendor-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">

        <h1
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Bazario
        </h1>

        <div className="flex items-center gap-6">

          {!user ? (
            <>
              <button onClick={() => navigate("/login")}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md">
                Login
              </button>

              <button onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Signup
              </button>
            </>
          ) : (
            <>
              <span className="font-medium">Hi, {user.name}</span>

              <button
                onClick={handleDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md">
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navbar;

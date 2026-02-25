import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.role) return navigate("/login");

    if (storedUser.role === "vendor") {
      navigate("/vendor-dashboard");
    } else if (storedUser.role === "customer") {
      navigate("/customer-dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">

        <h1
          className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Bazario
        </h1>

        <div className="flex items-center gap-4 sm:gap-6">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-indigo-600" />
            )}
          </button>

          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Signup
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                Hi, {user.name?.split(" ")[0] || user.email?.split("@")[0]}
              </span>

              <button
                onClick={handleDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
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
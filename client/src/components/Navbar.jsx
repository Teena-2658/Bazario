import { useState } from "react";
import { ShoppingCart, User, Search } from "lucide-react";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
          Bazario
        </h1>

        {/* Search Bar */}
        <div className="w-[45%]">
  <div className="flex items-center bg-gery-100 px-4 py-2 rounded-lg border-blue-500
                  border border-transparent 
                  focus-within:border-blue-500 
                  focus-within:ring-2 
                  focus-within:ring-blue-200 
                  transition-all duration-200">

    <Search size={18} className="text-gray-500" />

    <input
      type="text"
      placeholder="Search for Products, Brands and More"
      className="bg-transparent outline-none ml-2 w-full"
    />
  </div>
</div>


        {/* Right Section */}
        <div className="flex items-center gap-6 relative">

          {/* Login */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <User size={20} />
            <span className="font-medium">sign up</span>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-24 top-10 w-56 bg-white shadow-lg rounded-md p-3">
                <p className="text-sm font-semibold mb-2">New Customer?</p>
                <button className="w-full bg-blue-600 text-white py-1 rounded mb-3">
                  Sign Up
                </button>

                <ul className="text-sm space-y-2">
                  <li className="hover:text-blue-600 cursor-pointer">
                    My Profile
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Orders
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Wishlist
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="flex items-center gap-2 cursor-pointer relative">
            <ShoppingCart size={22} />
            <span className="font-medium">Cart</span>

            {/* Cart badge */}
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded-full">
              1
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Navbar;

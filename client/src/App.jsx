import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VendorDashboard from "./pages/VendorDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  const storedUser = localStorage.getItem("user");
  let user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
<Route path="/payment-success" element={<PaymentSuccess />} />
        {/* Vendor */}
        <Route
          path="/vendor-dashboard"
          element={
            user && user.role === "vendor"
              ? <VendorDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Customer */}
        <Route
          path="/customer-dashboard"
          element={
            user && user.role === "customer"
              ? <CustomerDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Protected Cart */}
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;

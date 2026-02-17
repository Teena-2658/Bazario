import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import VendorDashboard from "./pages/VendorDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryProducts from "./pages/CategoryProducts";
function App() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <BrowserRouter>
      <Navbar /> 
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
    <Route path="/category/:category" element={<CategoryProducts />} />
        <Route
          path="/vendor-dashboard"
          element={
            user?.role === "vendor"
              ? <VendorDashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/customer-dashboard"
          element={
            user?.role === "customer"
              ? <CustomerDashboard />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        <Footer />
    </BrowserRouter>
  );
}

export default App;

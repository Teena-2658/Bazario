import { useState } from "react";
import { API_URL } from "../config";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.email.trim()) {
      return "Email is required";
    }

    // ✅ Email must start with lowercase
    const emailRegex = /^[a-z][^\s@]*@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      return "Email must start with lowercase letter and be valid";
    }

    if (!formData.password) {
      return "Password is required";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ✅ Trim & Normalize before sending
      const cleanedData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      };

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      const userData = {
        ...data.user,
        token: data.token,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect after login
      window.location.href = "/";

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full rounded"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value.toLowerCase(), // ✅ auto lowercase
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-3 w-full rounded"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

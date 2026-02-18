import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name is required";
    }

   if (!form.email.trim()) {
  return "Email is required";
}

const emailRegex = /^[a-z][^\s@]*@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(form.email)) {
  return "Email must start with a lowercase letter and include @";
}


    if (!form.password) {
      return "Password is required";
    }

   if (!form.password) {
  return "Password is required";
}

// Strong Password Regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

if (!passwordRegex.test(form.password)) {
  return "Password must contain at least 6 characters, including 1 uppercase, 1 lowercase, 1 number and 1 special character";
}

    if (!form.role) {
      return "Please select a role";
    }

    return null; // No error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return; // Stop form submission
    }

    setError("");

    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Signup
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <input
          placeholder="Name"
          className="border p-2 w-full mb-3 rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="border p-2 w-full mb-4 rounded"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="">Select Role</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>

        <button className="bg-green-600 text-white w-full py-2 rounded">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;

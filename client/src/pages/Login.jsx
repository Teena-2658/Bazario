import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

   const res = await fetch(
  `${API_URL}/api/auth/login`
,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }
);


    const data = await res.json();

    if (res.ok) {
      const userData = {
        ...data.user,
        token: data.token,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      alert("Login Success");

      // ✅ reload so App reads new user
      window.location.href = "/";
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded w-80">

        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full"
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-3 w-full"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;

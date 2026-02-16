import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const sessionId = new URLSearchParams(
          window.location.search
        ).get("session_id");

        const user = JSON.parse(localStorage.getItem("user"));

        if (!sessionId || !user) {
          console.log("Missing session or user");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/orders/success?session_id=${sessionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await res.json();
        console.log("ORDER SAVE RESPONSE:", data);

        // redirect after save
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        console.log("SAVE ORDER ERROR:", err);
      }
    };

    saveOrder();
  }, []);

  return (
    <div className="h-screen flex justify-center items-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
    </div>
  );
};

export default PaymentSuccess;

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const saveOrder = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      await fetch(
        `${API_URL}/api/orders/success?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // 2 sec baad dashboard
      setTimeout(() => {
        navigate("/customer-dashboard");
      }, 2000);
    };

    if (sessionId) {
      saveOrder();
    }
  }, [sessionId]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>
      <p className="mt-2">Redirecting to dashboard...</p>
    </div>
  );
};

export default PaymentSuccess;

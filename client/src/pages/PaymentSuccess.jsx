import { useEffect } from "react";

const PaymentSuccess = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const sessionId = new URLSearchParams(
      window.location.search
    ).get("session_id");

    if (!sessionId) return;

    fetch(
      `http://localhost:5000/api/orders/success?session_id=${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
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

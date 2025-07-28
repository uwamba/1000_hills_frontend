"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentStatusPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");
      const statusParam = searchParams.get("status");

      if (!transactionId || !txRef || !statusParam) {
        setStatus("invalid");
        setLoading(false);
        return;
      }

      try {
        const authToken = localStorage.getItem("authToken");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/flutterwave/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken ?? ""}`,
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            tx_ref: txRef,
            status: statusParam,
          }),
        });

        const data = await res.json();

        console.log("Payment verification response:", data);

        if (res.ok) {
          if (data.status === "successful") {
            setStatus("success");
            setDetails(data.payment_details || null);
          } else if (data.status === "cancelled") {
            setStatus("cancelled");
          } else {
            setStatus("failed");
          }
        } else {
          console.error("Payment verification error", data);
          setStatus("error");
        }
      } catch (error) {
        console.error("Payment verification error", error);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, []);

  const renderStatusMessage = () => {
    switch (status) {
      case "success":
        return <div className="text-green-600 text-xl font-semibold">✅ Payment Successful!</div>;
      case "cancelled":
        return <div className="text-yellow-600 text-xl font-semibold">⚠️ Payment Cancelled.</div>;
      case "failed":
        return <div className="text-red-600 text-xl font-semibold">❌ Payment Failed.</div>;
      case "invalid":
        return <div className="text-gray-600 text-xl font-semibold">❗ Invalid Payment Details.</div>;
      case "error":
        return <div className="text-red-500 text-xl font-semibold">🚨 An error occurred while verifying payment.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-grow mx-6 md:mx-[100px] py-12">
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-md p-6 text-center">
          {loading ? (
            <div className="text-blue-600 text-lg">🔄 Verifying payment...</div>
          ) : (
            <>
              {renderStatusMessage()}

              {status === "success" && details && (
                <div className="mt-6 max-w-md mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-6 text-left text-gray-800">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <span>💳</span> Payment Details
                  </h2>
                  <div className="space-y-3">
                    <p><strong className="text-gray-700">Amount:</strong> <span className="text-gray-900">{details.amount} {details.currency}</span></p>
                    <p><strong className="text-gray-700">Transaction ID:</strong> <span className="text-gray-900">{details.transaction_id}</span></p>
                    <p><strong className="text-gray-700">Tx Ref:</strong> <span className="text-gray-900">{details.tx_ref}</span></p>
                    <p><strong className="text-gray-700">Payment Method:</strong> <span className="text-gray-900">{details.payment_type ?? "N/A"}</span></p>
                    <p><strong className="text-gray-700">Date:</strong> <span className="text-gray-900">{new Date(details.created_at).toLocaleString()}</span></p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

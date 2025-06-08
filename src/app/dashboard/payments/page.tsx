'use client';

import React, { useEffect, useState } from 'react';

type Client = {
  id: number;
  name: string;
  email?: string;
};

type Payment = {
  id: number;
  client_id: number;
  transaction_id: string;
  amount_paid: number;
  account: string;
  type: string;
  status: string;
  created_at: string;
  client?: Client;
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (data && Array.isArray(data.data)) {
        setPayments(data.data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (paymentId: number) => {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Not authenticated");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${paymentId}/status`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to check status");
      alert("Failed to check status");
      return;
    }

    const result = await res.json();
    console.log("Payment status response:", result);

    if (result.success && result.data) {
      alert(`Status: ${result.data.status}\nAmount: ${result.data.amount}`);
    } else {
      alert(`Status check failed: ${result.message}`);
    }
  } catch (error) {
    console.error("Error checking status:", error);
    alert("An error occurred while checking status.");
  }
};


  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Payments</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-md"
            >
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Transaction:</span>{' '}
                {payment.transaction_id}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Amount:</span> ${payment.amount_paid}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Account:</span> {payment.account}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Type:</span> {payment.type}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Status:</span>{' '}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    payment.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {payment.status}
                </span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium text-gray-800">Client:</span> {payment.client?.name}
              </p>

              <button
                onClick={() => handleCheckStatus(payment.id)}
                className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
              >
                Check Status
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;

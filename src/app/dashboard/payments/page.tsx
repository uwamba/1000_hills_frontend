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
  currency_code: string;
  client?: Client;
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [month, setMonth] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // ✅ Build query params
      const params = new URLSearchParams();
      if (fromDate && toDate) {
        params.append('from_date', fromDate);
        params.append('to_date', toDate);
      }
      if (month) {
        params.append('month', month);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();
      console.log('Fetched payments:', data);

      // Normalize currency_code
      const normalize = (p: any) => ({
        ...p,
        currency_code: p.currency_code ?? 'USD',
      });

      let paymentsArray: Payment[] = [];
      if (Array.isArray(data)) {
        paymentsArray = data.map(normalize);
      } else if (data && Array.isArray(data.data)) {
        paymentsArray = data.data.map(normalize);
      }

      // Sort by created_at descending (most recent first)
      paymentsArray.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setPayments(paymentsArray);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (paymentId: number) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Not authenticated');
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${paymentId}/status`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!res.ok) {
        console.error('Failed to check status');
        alert('Failed to check status');
        return;
      }

      const result = await res.json();
      console.log('Payment status response:', result);

      if (result.success && result.data) {
        alert(
          `Status: ${result.data.status}\nAmount: ${result.data.amount} ${result.data.currency_code}`
        );
      } else {
        alert(`Status check failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      alert('An error occurred while checking status.');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Payments</h1>

      {/* ✅ Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded p-2 text-sm text-black"
          />

        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded p-2 text-sm text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded p-2 text-sm text-black"
          />
        </div>
        <button
          onClick={fetchPayments}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Transaction
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Currency
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Account
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Client
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.transaction_id}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.amount_paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.currency_code}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.account}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.type}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${payment.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {payment.client?.name ?? '-'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleCheckStatus(payment.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    >
                      Check Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;

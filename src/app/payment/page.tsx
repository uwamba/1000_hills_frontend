'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const clientName  = params.get('names')  || '';
  const email       = params.get('email')  || '';
  const country     = params.get('country')|| '';
  const phone       = params.get('phone')  || '';
  const amount      = params.get('amount') || '';

  const [isLoading, setIsLoading] = useState(false);

  // If any required param is missing, redirect back
  useEffect(() => {
    if (!clientName || !email || !amount) {
      router.replace('/');
    }
  }, [clientName, email, amount, router]);

  const handlePayNow = async () => {
    setIsLoading(true);

    // 1️⃣ Option A: Redirect directly to a payment link URL passed in query
    // const paymentLink = params.get('paymentLink');
    // if (paymentLink) return window.location.href = paymentLink;

    // 2️⃣ Option B: Call your backend to generate a payment session and return a URL
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ names: clientName, email, country, phone, amount }),
      });
      if (!res.ok) throw new Error('Payment link creation failed');
      const { url } = await res.json();
      window.location.href = url;  // redirect to the payment gateway
    } catch (err) {
      console.error(err);
      alert('Failed to generate payment link. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">Confirm Payment</h1>
        <dl className="space-y-2 text-gray-800">
          <div>
            <dt className="font-medium">Name</dt>
            <dd>{clientName}</dd>
          </div>
          <div>
            <dt className="font-medium">Email</dt>
            <dd>{email}</dd>
          </div>
          {country && (
            <div>
              <dt className="font-medium">Country</dt>
              <dd>{country}</dd>
            </div>
          )}
          {phone && (
            <div>
              <dt className="font-medium">Phone</dt>
              <dd>{phone}</dd>
            </div>
          )}
          <div className="mt-4">
            <dt className="font-medium">Amount to Pay</dt>
            <dd className="text-xl font-semibold">{amount}</dd>
          </div>
        </dl>

        <button
          onClick={handlePayNow}
          disabled={isLoading}
          className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Redirecting…' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}

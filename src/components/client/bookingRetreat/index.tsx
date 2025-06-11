'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  retreatTitle: string;
  retreatId: number;
}

export default function BookingRetreat({
  isOpen,
  onClose,
  retreatTitle,
  retreatId,
}: BookingFormProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'otp' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fromDate: '',
    toDate: '',
    payment_method: '',
    momo_number: '',
  });
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const sendOtp = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${retreatId}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to send OTP');
      setStep('otp');
    } catch (error) {
      console.error(error);
      alert('Failed to send OTP!');
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${retreatId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp }),
      });
      if (!response.ok) throw new Error('OTP verification failed');
      setStep('success');
    } catch (error) {
      console.error(error);
      alert('OTP verification failed!');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: '',
      email: '',
      phone: '',
      fromDate: '',
      toDate: '',
      payment_method: '',
      momo_number: '',
    });
    setOtp('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-md w-full rounded-lg p-6 shadow-lg relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
          >
            &times;
          </button>

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Dialog.Title className="text-xl font-semibold mb-2">
                Book Retreat: <span className="text-indigo-600">{retreatTitle}</span>
              </Dialog.Title>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To Date</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2 text-black"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <Dialog.Title className="text-xl font-semibold mb-2">Choose Payment Method</Dialog.Title>
              <label className="block">
                <span className="text-black">Payment Method</span>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full mt-1 border rounded px-3 py-2 text-black"
                  required
                >
                  <option value="">Select a payment method</option>
                  <option value="momo">Mobile Money</option>
                  <option value="card">Credit Card</option>
                </select>
              </label>

              {formData.payment_method === 'momo' && (
                <label className="block">
                  <span className="text-black">Mobile Money Number</span>
                  <input
                    type="text"
                    name="momo_number"
                    value={formData.momo_number}
                    onChange={handleInputChange}
                    className="w-full mt-1 border rounded px-3 py-2 text-black"
                    required
                  />
                </label>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('form')}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Back
                </button>
                <button
                  onClick={sendOtp}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isSending ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <Dialog.Title className="text-xl font-semibold mb-2">Enter OTP</Dialog.Title>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter OTP"
                required
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('payment')}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Back
                </button>
                <button
                  onClick={verifyOtp}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center text-green-600 font-semibold text-lg">
              Booking successful! 🎉
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

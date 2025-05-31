// components/bookingRetreat.tsx
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${retreatId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to book retreat');
      }

      alert('Booking successful!');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Booking failed!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-md w-full rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Book Retreat: <span className="text-indigo-600">{retreatTitle}</span>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="w-full mt-1 border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface RetreatFormData {
  title: string;
  description: string;
  address: string;
  capacity: number;
  status: string;
}

export default function AddRetreatPage() {
  const [formData, setFormData] = useState<RetreatFormData>({
    title: '',
    description: '',
    address: '',
    capacity: 1,
    status: '',
  });

  const [photoInputs, setPhotoInputs] = useState<(File | null)[]>([null]);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) : value,
    }));
  };

  const handlePhotoChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const updated = [...photoInputs];
    updated[index] = file;
    setPhotoInputs(updated);
  };

  const addPhotoField = () => {
    setPhotoInputs((prev) => [...prev, null]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('address', formData.address);
    payload.append('capacity', formData.capacity.toString());
    payload.append('status', formData.status);
    payload.append('object_type', 'retreat'); // Important if photos are polymorphic

    photoInputs.forEach((photo) => {
      if (photo instanceof File) {
        payload.append('photos[]', photo);
      }
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats`, {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to create retreat');
      }

      router.push('/retreats');
    } catch (error) {
      console.error('Error creating retreat:', error);
      setErrorMessage('❌ Failed to create retreat. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Add New Retreat</h1>

      {errorMessage && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Capacity"
              min={1}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Description"
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
          <div className="space-y-2">
            {photoInputs.map((_, index) => (
              <input
                key={index}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(index, e)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addPhotoField}
            className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            + Add Another Photo
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-700 rounded hover:bg-blue-800 transition"
          >
            Submit Retreat
          </button>
        </div>
      </form>
    </div>
  );
}

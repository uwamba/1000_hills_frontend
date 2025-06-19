'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface ApartmentOwnerFormProps {
  // If editing, pass existing owner data; for creation, leave undefined.
  existingOwner?: {
    id: number;
    name: string;
    address: string;
    contract_path: string | null;
    status: string | null;
  };
  // Callback after successful submit (e.g., to redirect or refresh list).
  onSuccess?: () => void;
}

interface FormDataType {
  name: string;
  address: string;
  contract: File | null;
  status: string;
}

export default function ApartmentOwnerForm({
  existingOwner,
  onSuccess,
}: ApartmentOwnerFormProps) {
  // Initialize form data: if editing, prefill; else empty
  const [formData, setFormData] = useState<FormDataType>({
    name: existingOwner?.name ?? '',
    address: existingOwner?.address ?? '',
    contract: null,
    status: existingOwner?.status ?? '',
  });
  const [authToken, setAuthToken] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // On mount, fetch auth token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  // Handle text inputs/select/textarea
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle contract file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({
      ...prev,
      contract: file,
    }));
  };

  // Optionally: handler to remove existing contract (if you implement an API endpoint to clear it)
  const handleRemoveContract = async () => {
    if (!existingOwner) return;
    if (!authToken) {
      alert('Not authenticated');
      return;
    }
    // Confirm removal
    if (!confirm('Remove existing contract?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartment-owners/${existingOwner.id}/remove-contract`,
        {
          method: 'POST', // or DELETE depending on your backend design
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // adjust if your endpoint needs payload
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to remove contract:', text);
        alert('Failed to remove contract.');
      } else {
        alert('Contract removed.');
        // Optionally refresh parent or re-fetch owner data:
        onSuccess && onSuccess();
      }
    } catch (err) {
      console.error('Error removing contract:', err);
      alert('Network error');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authToken) {
      alert('Not authenticated');
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('address', formData.address);
      payload.append('status', formData.status);

      // If a new contract file is selected, append it
      if (formData.contract) {
        payload.append('contract', formData.contract);
      }
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartment-owners`;
      let method = 'POST';
      if (existingOwner) {
        // Editing: use PUT via method spoofing
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartment-owners/${existingOwner.id}`;
        payload.append('_method', 'PUT');
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: payload,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Server error:', text);
        alert(`Failed to ${existingOwner ? 'update' : 'create'} owner.`);
      } else {
        alert(
          existingOwner
            ? 'Apartment owner updated successfully!'
            : 'Apartment owner created successfully!'
        );
        // Reset form if created
        if (!existingOwner) {
          setFormData({
            name: '',
            address: '',
            contract: null,
            status: '',
          });
        }
        // Callback (e.g., navigate away or refresh list)
        onSuccess && onSuccess();
      }
    } catch (err) {
      console.error('Error submitting:', err);
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded space-y-6 text-black"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {existingOwner ? 'Edit Apartment Owner' : 'Add New Apartment Owner'}
      </h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Existing contract info when editing */}
      {existingOwner && existingOwner.contract_path && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Current Contract
          </label>
          <div className="flex items-center space-x-2">
            <a
              href={`${process.env.NEXT_PUBLIC_FILE_BASE_URL_STORAGE}/${existingOwner.contract_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View / Download
            </a>
            {/* If you implement an endpoint to remove contract, enable this button */}
            <button
              type="button"
              onClick={handleRemoveContract}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Contract upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {existingOwner ? 'Replace Contract (optional)' : 'Contract Document'}
        </label>
        <input
          type="file"
          name="contract"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 text-white rounded ${
            submitting ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {submitting
            ? existingOwner
              ? 'Updating...'
              : 'Submitting...'
            : existingOwner
            ? 'Save Changes'
            : 'Submit Apartment Owner'}
        </button>
      </div>
    </form>
  );
}

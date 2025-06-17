"use client";

import { useState } from "react";
// ✅ Use the updated package


export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [issue, setIssue] = useState("");
  const [category, setCategory] = useState("general");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const templateParams = {
      name,
      phone,
      address,
      description,
      issue,
      category,
      to_email: "gato@livatrip.com", // 👈 Target recipient
    };

  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-6 shadow-md rounded bg-white text-black"
      >
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Issue</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded ${
            isSubmitting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

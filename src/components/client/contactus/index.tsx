"use client";

import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ContactUsComponent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

    try {
      const response = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          description,
          issue,
          category,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Submission failed");
      }

      setSuccess("Message sent and saved successfully!");
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setIssue("");
      setDescription("");
      setCategory("general");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-5xl">
        {/* Sidebar */}
        <div className="md:w-1/3 bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-4">Office Info</h2>
          <p className="mb-2"><strong>Phone:</strong> 078xxxxxx</p>
          <p className="mb-2"><strong>Street:</strong> KG36G</p>
          <p className="mb-2"><strong>Location:</strong> Kigali, Rwanda</p>
          <p className="mb-2"><strong>Email:</strong> office@example.com</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-2/3 p-6 bg-white text-gray-900"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Contact Us</h2>

          {success && <p className="text-green-600 text-center mb-3">{success}</p>}
          {error && <p className="text-red-600 text-center mb-3">{error}</p>}

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Issue</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
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
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded text-white font-semibold ${
              isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

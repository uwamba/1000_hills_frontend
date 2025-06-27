"use client";

import { useEffect, useState } from "react";

interface ExchangeRate {
  id?: number;
  currency_code: string;
  rate_to_usd: string;
}

export default function ExchangeRateForm() {
  const [formData, setFormData] = useState<ExchangeRate>({
    currency_code: "",
    rate_to_usd: "",
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/exchange-rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save exchange rate");
      }

      alert(`Exchange rate ${isEditing ? "updated" : "added"} successfully`);
      setFormData({ currency_code: "", rate_to_usd: "" });
      setIsEditing(false);
      fetchRates();
    } catch (error) {
      console.error("Error saving rate:", error);
      alert("There was a problem saving the exchange rate.");
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch(`${apiUrl}/exchange-rates`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setExchangeRates(data);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const handleEdit = (rate: ExchangeRate) => {
    setFormData({
      currency_code: rate.currency_code,
      rate_to_usd: rate.rate_to_usd,
    });
    setIsEditing(true);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6 text-black">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit Exchange Rate" : "Add Exchange Rate"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Currency Code</label>
            <input
              type="text"
              name="currency_code"
              maxLength={3}
              value={formData.currency_code}
              onChange={handleChange}
              className="w-full p-2 border border-gray-400 rounded text-black"
              placeholder="e.g. USD, RWF"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Rate to USD</label>
            <input
              type="number"
              name="rate_to_usd"
              value={formData.rate_to_usd}
              onChange={handleChange}
              className="w-full p-2 border border-gray-400 rounded text-black"
              step="0.0001"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-700 rounded hover:bg-blue-800 transition"
          >
            {isEditing ? "Update Exchange Rate" : "Submit Exchange Rate"}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      <h3 className="text-xl font-bold mb-2">Existing Exchange Rates</h3>
      <table className="w-full border text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Currency</th>
            <th className="p-2 border">Rate to USD</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exchangeRates.map((rate) => (
            <tr key={rate.currency_code}>
              <td className="p-2 border">{rate.currency_code}</td>
              <td className="p-2 border">{rate.rate_to_usd}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(rate)}
                  className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {exchangeRates.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No rates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

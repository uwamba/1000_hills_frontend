"use client";

import React, { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface BookingFormProps {
  propertyId: string;
  price: number;
object_type: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, price, object_type }) => {
  const [formData, setFormData] = useState({
    from_date_time: "",       // ISO string from datetime-local
    to_date_time: "",
    email: "",
    names: "",
    country: "",
    phone: "",
    object_type: object_type,
    object_id: propertyId,
    amount_to_pay: price.toString(),
    status: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setShowModal(true);
    setStep("form");
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      from_date_time: "",
      to_date_time: "",
      email: "",
      names: "",
      country: "",
      phone: "",
      object_type: "App\\Models\\Room",
      object_id: propertyId,
      amount_to_pay: price.toString(),
      status: "",
    });
    setOtp("");
    setStep("form");
  };

  const sendOtp = async () => {
    // Basic check to ensure dates are filled
    if (!formData.from_date_time || !formData.to_date_time) {
      return alert("Please select both From and To dates before continuing.");
    }

    setIsSending(true);
    try {
      const res = await fetch(`${apiUrl}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setStep("otp");
    } catch (err) {
      alert("Error sending OTP");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`${apiUrl}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, otp }),
      });
      if (!res.ok) throw new Error("Invalid OTP");

      // Before booking, log payload
      console.log("Booking payload:", formData);

      const bookingRes = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!bookingRes.ok) throw new Error("Booking failed");

      setStep("success");
    } catch (err) {
      alert("Verification or booking failed");
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Book Now
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <p className="text-xs text-gray-400 mb-2">Step: {step}</p>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>

            {step === "form" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Booking Details</h2>

                {/* DATE-TIME PICKERS */}
                <label className="block">
                  <span className="text-gray-700">From</span>
                  <input
                    type="datetime-local"
                    name="from_date_time"
                    value={formData.from_date_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">To</span>
                  <input
                    type="datetime-local"
                    name="to_date_time"
                    value={formData.to_date_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </label>

                {/* CLIENT INFO */}
                <input
                  type="text"
                  name="names"
                  placeholder="Full Name"
                  value={formData.names}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />

                {/* CONTINUE */}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={isSending}
                  className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isSending ? "Sending OTP..." : "Continue"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Verify OTP</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={isVerifying}
                  className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isVerifying ? "Verifying..." : "Verify & Book"}
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-green-700">Booking Confirmed!</h2>
                <p>Thank you. We’ll be in touch soon.</p>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingForm;

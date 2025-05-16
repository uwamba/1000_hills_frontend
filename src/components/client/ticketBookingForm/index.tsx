"use client";

import React, { useState } from "react";
import { FaChair, FaTimes } from "react-icons/fa";

interface BookingFormProps {
  propertyId: string;
  price: number;
  object_type: string;
  seatLayout: {
    row: number;
    seats_per_row: number;
    exclude: number[];
  };
}

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const TicketBookingForm: React.FC<BookingFormProps> = ({
  propertyId,
  price,
  object_type,
  seatLayout,
}) => {
  const [formData, setFormData] = useState({
    from_date_time: "",
    to_date_time: "",
    email: "",
    names: "",
    country: "",
    phone: "",
    object_type,
    object_id: propertyId,
    amount_to_pay: price.toString(),
    seat_number: "",
    status: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"select-seat" | "form" | "otp" | "success">("select-seat");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
    setStep("select-seat");
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
      object_type,
      object_id: propertyId,
      amount_to_pay: price.toString(),
      seat_number: "",
      status: "",
    });
    setOtp("");
    setStep("select-seat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeatSelect = (seatNumber: number) => {
    setFormData((prev) => ({ ...prev, seat_number: seatNumber.toString() }));
    setStep("form");
  };

  const sendOtp = async () => {
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

  const renderSeatLayout = () => {
    const { row, seats_per_row, exclude } = seatLayout;
    const layout = [];
    let seatId = 1;

    for (let r = 0; r < row; r++) {
      const rowSeats = [];
      for (let s = 0; s < seats_per_row; s++) {
        const isExcluded = exclude.includes(seatId);
        const isSelected = formData.seat_number === seatId.toString();

        rowSeats.push(
          <button
            key={seatId}
            disabled={isExcluded}
            onClick={() => handleSeatSelect(seatId)}
            className={`m-1 p-2 rounded ${
              isExcluded
                ? "bg-gray-300 cursor-not-allowed"
                : isSelected
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <FaChair />
            <span className="block text-xs">{seatId}</span>
          </button>
        );
        seatId++;
      }
      layout.push(
        <div key={`row-${r}`} className="flex justify-center mb-2">
          {rowSeats}
        </div>
      );
    }
    return layout;
  };

  return (
    <>
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        onClick={openModal}
      >
        Book Now
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center"
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains("bg-black")) closeModal();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <FaTimes size={18} />
            </button>

            {step === "select-seat" && (
              <>
                <h2 className="text-lg font-bold mb-4">Select Your Seat</h2>
                {renderSeatLayout()}
              </>
            )}

            {step === "form" && (
              <>
                <h2 className="text-lg font-bold mb-4">Enter Booking Details</h2>
                <div className="space-y-2">
                  <input
                    name="from_date_time"
                    type="datetime-local"
                    value={formData.from_date_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="to_date_time"
                    type="datetime-local"
                    value={formData.to_date_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="names"
                    placeholder="Full Names"
                    value={formData.names}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />

                  <button
                    onClick={sendOtp}
                    disabled={isSending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2"
                  >
                    {isSending ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              </>
            )}

            {step === "otp" && (
              <>
                <h2 className="text-lg font-bold mb-4">Enter OTP</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                />
                <button
                  onClick={verifyOtp}
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  {isVerifying ? "Verifying..." : "Verify and Book"}
                </button>
              </>
            )}

            {step === "success" && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Successful!</h2>
                <p>Check your email for confirmation.</p>
                <button
                  onClick={closeModal}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TicketBookingForm;

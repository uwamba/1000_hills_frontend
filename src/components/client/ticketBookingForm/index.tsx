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

    email: "",
    names: "",
    country: "",
    phone: "",
    object_type,
    object_id: propertyId,
    amount_to_pay: price.toString(),
    seat: "",
    status: "",

    payment_method: "",     // <-- New field
    extra_note: "",
    momo_number: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"select-seat" | "form" | "otp" | "payment" | "success">("select-seat");
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
      email: "",
      names: "",
      country: "",
      phone: "",
      object_type,
      object_id: propertyId,
      amount_to_pay: price.toString(),
      seat: "",
      status: "",

      payment_method: "",     // <-- New field
      extra_note: "",
      momo_number: "",
    });
    setOtp("");
    setStep("select-seat");
  };

  const goToPaymentStep = () => {

    if (!formData.email || !formData.names || !formData.phone || !formData.country) {
      return alert("Please complete all personal details.");
    }
    setStep("payment");
  };

  const handleSeatSelect = (seatNumber: number) => {
    setFormData((prev) => ({ ...prev, seat: seatNumber.toString() }));
    setStep("form");
  };

  const sendOtp = async () => {


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

      const bookingRes = await fetch(`${apiUrl}/booking/ticket`, {
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
const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const renderSeatLayout = () => {
    const { row, seats_per_row, exclude } = seatLayout;
    const layout = [];
    let seatId = 1;

    for (let r = 0; r < row; r++) {
      const rowSeats = [];
      for (let s = 0; s < seats_per_row; s++) {
        const isExcluded = exclude.includes(seatId);
        const isSelected = formData.seat === seatId.toString();

        rowSeats.push(
          <button
            key={seatId}
            disabled={isExcluded}
            onClick={() => handleSeatSelect(seatId)}
            className={`m-1 p-2 rounded ${isExcluded
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
              className="absolute top-3 right-3 text-black-600 hover:text-black"
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
                <h2 className="text-lg font-bold mb-4 text-black-600">Enter Booking Details</h2>
                <div className="space-y-2">

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

              

                  <div className="flex justify-between">
                 
                  <button
                    type="button"
                    onClick={goToPaymentStep}
                    disabled={isSending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isSending ? "Sending OTP..." : "Continue"}
                  </button>
                </div>

                  
                </div>
              </>
            )}
            {/* Step 2: Payment Method */}
            {step === "payment" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black">Choose Payment Method</h2>

                <label className="block">
                  <span className="text-black">Payment Method</span>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded mt-1 text-black"
                  >
                    <option value="">-- Select Payment Method --</option>
                    <option value="momo_rwanda">MOMO (MTN Rwanda)</option>
                    <option value="flutterwave">Flutterwave (MOMO, Airtel, Card, Bank Transfer)</option>
                  </select>
                </label>

                {formData.payment_method === "momo_rwanda" && (
                  <div>
                    <label className="block">
                      <span className="text-black">MoMo Phone Number</span>
                      <input
                        type="number"
                        name="momo_number"
                        placeholder="momo_number (e.g., 2507XXXXXXXX)"
                        value={formData.momo_number}
                        onChange={(e) => handleInputChange({ name: "momo_number", value: e.target.value })}
                        className="w-full p-2 border rounded text-black"
                      />
                      <textarea
                        name="extra_note"
                        placeholder="Additional Notes (optional)"
                        value={formData.extra_note}
                        onChange={(e) => handleInputChange({ name: "extra_note", value: e.target.value })}
                        className="w-full p-2 border rounded text-black"
                      />

                    </label>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep("form")}
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isSending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isSending ? "Sending OTP..." : "Continue"}
                  </button>
                </div>
              </div>
            )}
            {step === "otp" && (
              <>
                <h2 className="text-lg font-bold mb-4 text-black-600">Enter OTP</h2>
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

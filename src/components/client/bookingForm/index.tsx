"use client";

import { useState, useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface BookingFormProps {
  propertyId: string;
  price: number;
  object_type: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  propertyId,
  price,
  object_type,
}) => {
  const initialFormState = {
    from_date_time: new Date().toISOString().split("T")[0] + "T00:00",
    to_date_time: new Date().toISOString().split("T")[0] + "T00:00",
    email: "",
    names: "",
    country: "",
    phone: "",
    object_type,
    object_id: propertyId,
    amount_to_pay: price.toString(),
    status: "",
    payment_method: "",
    extra_note: "",
    momo_number: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "payment" | "otp" | "success">("form");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setShowModal(true);
    setStep("form");
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setOtp("");
    setStep("form");
  };

  const validateFormStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ÿ '-]+$/;
    const phoneRegex = /^(07\d{8}|2507\d{8})$/;

    if (!formData.from_date_time || !formData.to_date_time) {
      alert("Please select both From and To dates.");
      return false;
    }

    if (formData.from_date_time > formData.to_date_time) {
      alert("To date must be after From date.");
      return false;
    }

    if (!formData.names || !nameRegex.test(formData.names)) {
      alert("Please enter a valid Full Name.");
      return false;
    }

    if (!formData.country) {
      alert("Please enter your Country.");
      return false;
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      alert("Please enter a valid Email.");
      return false;
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      alert("Please enter a valid Phone number (e.g., 078XXXXXXX or 25078XXXXXXX).");
      return false;
    }

    return true;
  };

  const goToPaymentStep = () => {
    if (validateFormStep()) {
      setStep("payment");
    }
  };

  const sendOtp = async () => {
    const { momo_number, payment_method, email } = formData;

    if (!payment_method) {
      return alert("Please select a payment method.");
    }

    if (payment_method === "momo_rwanda") {
      const momoRegex = /^2507\d{8}$/;
      if (!momoRegex.test(momo_number)) {
        return alert("Please enter a valid MoMo phone number (format: 2507XXXXXXXX).");
      }
    }

    setIsSending(true);
    try {
      const res = await fetch(`${apiUrl}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
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

  useEffect(() => {
    const from = new Date(formData.from_date_time);
    const to = new Date(formData.to_date_time);
    const timeDiff = to.getTime() - from.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const validDays = dayDiff > 0 ? dayDiff : 0;
    const total = validDays * price;

    setCalculatedPrice(total);
    setFormData((prev) => ({ ...prev, amount_to_pay: total.toString() }));
  }, [formData.from_date_time, formData.to_date_time, price]);

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
      console.log("Booking successful", formData);

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
            <p className="text-xs text-gray-800 mb-2">Step: {step}</p>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>

            {step === "form" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black">Booking Details</h2>

                <label className="block">
                  <span className="text-black">From</span>
                  <input
                    type="date"
                    name="from_date_time"
                    value={formData.from_date_time.split("T")[0]}
                    onChange={(e) =>
                      handleInputChange({
                        name: "from_date_time",
                        value: `${e.target.value}T00:00`,
                      })
                    }
                    className="w-full p-2 border rounded mt-1 text-black"
                  />
                </label>

                <label className="block">
                  <span className="text-black">To</span>
                  <input
                    type="date"
                    name="to_date_time"
                    value={formData.to_date_time.split("T")[0]}
                    onChange={(e) =>
                      handleInputChange({
                        name: "to_date_time",
                        value: `${e.target.value}T00:00`,
                      })
                    }
                    className="w-full p-2 border rounded mt-1 text-black"
                  />
                </label>

                <div className="text-black font-medium">
                  Price per day: {price} <br />
                  Total Price: <span className="font-bold">{calculatedPrice}</span>
                </div>

                <input
                  type="text"
                  name="names"
                  placeholder="Full Name"
                  value={formData.names}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-black"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-black"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-black"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-black"
                />

                <button
                  type="button"
                  onClick={goToPaymentStep}
                  className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
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
                        placeholder="e.g., 2507XXXXXXXX"
                        value={formData.momo_number}
                        onChange={(e) =>
                          handleInputChange({ name: "momo_number", value: e.target.value })
                        }
                        className="w-full p-2 border rounded text-black"
                      />
                      <textarea
                        name="extra_note"
                        placeholder="Additional Notes (optional)"
                        value={formData.extra_note}
                        onChange={(e) =>
                          handleInputChange({ name: "extra_note", value: e.target.value })
                        }
                        className="w-full p-2 border rounded text-black mt-2"
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

            {/* OTP Step */}
            {step === "otp" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black">Verify OTP</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded text-black"
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

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-green-700">Booking Confirmed!</h2>
                <p className="text-black">Thank you. We’ll be in touch soon.</p>
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

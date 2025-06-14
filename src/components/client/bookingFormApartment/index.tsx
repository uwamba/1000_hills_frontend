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
  const [pricingMethod, setPricingMethod] = useState<"daily" | "monthly">("daily");
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

  const goToPaymentStep = () => {
    const from = new Date(formData.from_date_time);
    const to = new Date(formData.to_date_time);
    const monthDiff = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();

    if (!formData.from_date_time || !formData.to_date_time) {
      return alert("Please select both From and To dates.");
    }

    if (
      pricingMethod === "monthly" &&
      (monthDiff < 1 || from.getDate() !== 1 || to.getDate() !== 1)
    ) {
      return alert("Monthly booking must be at least 1 full month (start & end on the 1st).");
    }

    if (!formData.email || !formData.names || !formData.phone || !formData.country) {
      return alert("Please complete all personal details.");
    }

    setStep("payment");
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

    let total = 0;

    if (pricingMethod === "daily") {
      const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const validDays = dayDiff > 0 ? dayDiff : 0;
      total = validDays * price;
    } else {
      const monthDiff =
        (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
      const validMonths = monthDiff > 0 ? monthDiff : 0;
      total = validMonths * price;
    }

    setCalculatedPrice(total);
    setFormData((prev) => ({ ...prev, amount_to_pay: total.toString() }));
  }, [formData.from_date_time, formData.to_date_time, price, pricingMethod]);

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

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Book Apartment
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
                <h2 className="text-2xl font-bold text-black">Apartment Booking</h2>

                <label className="block">
                  <span className="text-black">Pricing Method</span>
                  <select
                    value={pricingMethod}
                    onChange={(e) => setPricingMethod(e.target.value as "daily" | "monthly")}
                    className="w-full p-2 border rounded text-black mt-1"
                  >
                    <option value="daily">Price Per Night</option>
                    <option value="monthly">Price Per Month</option>
                  </select>
                </label>

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
                    className="w-full p-2 border rounded text-black"
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
                    className="w-full p-2 border rounded text-black"
                  />
                </label>

                <div className="text-black font-medium">
                  {pricingMethod === "daily"
                    ? `Price per night: ${price}`
                    : `Price per month: ${price}`}
                  <br />
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

            {/* Payment, OTP, and Success steps remain unchanged */}
            {/* ... */}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingForm;

// Full BookingModal Component with Validation, Payment, OTP, and Success Steps

"use client";
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Photo {
  id: number;
  url: string;
}

interface Apartment {
  id: number;
  name: string;
  address: string;
  number_of_bedroom: number;
  kitchen_inside: boolean;
  kitchen_outside: boolean;
  number_of_floor: number;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
  price_per_night: number;
  price_per_month: number;
  currency?: string;
}

type BookingModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  apartment: Apartment | null;
};

export default function BookingModal({ isOpen, closeModal, apartment }: BookingModalProps) {
  const [step, setStep] = useState("form");
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    pricing_method: "daily",
    names: "",
    country: "",
    email: "",
    phone: "",
    from_date_time: "",
    to_date_time: "",
    payment_method: "",
    momo_number: "",
    extra_note: "",
    object_type: "apartment",
    object_id: apartment ? apartment.id.toString() : "",
    booking_status: "pending",
    amount_to_pay: 0,
  });

  const getDaysBetween = (start: string, end: string): number => {
    const from = new Date(start);
    const to = new Date(end);
    const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getMonthsBetween = (start: string, end: string): number => {
    const days = getDaysBetween(start, end);
    return Math.ceil(days / 30);
  };

  useEffect(() => {
    if (!apartment) return;

    const { from_date_time, to_date_time, pricing_method } = formData;
    if (from_date_time && to_date_time) {
      const days = getDaysBetween(from_date_time, to_date_time);
      if (pricing_method === "daily") {
        setTotalPrice(days * apartment.price_per_night);
        setSelectedDuration(`${days} day${days !== 1 ? "s" : ""}`);
      } else if (pricing_method === "monthly") {
        if (days < 30) {
          setTotalPrice(0);
          setSelectedDuration("Minimum 30 days required");
        } else {
          const months = getMonthsBetween(from_date_time, to_date_time);
          setTotalPrice(months * apartment.price_per_month);
          setSelectedDuration(`${months} month${months !== 1 ? "s" : ""}`);
        }
      }
    } else {
      setTotalPrice(0);
      setSelectedDuration("");
    }
  }, [formData.from_date_time, formData.to_date_time, formData.pricing_method, apartment]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, amount_to_pay: totalPrice }));
  }, [totalPrice]);

  useEffect(() => {
    if (apartment) {
      setFormData((prev) => ({ ...prev, object_id: apartment.id.toString() }));
    }
  }, [apartment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s]+$/;
    const momoRegex = /^2507\d{8}$/;

    if (!formData.names.trim()) newErrors.names = "Full name is required";
    else if (!nameRegex.test(formData.names)) newErrors.names = "Invalid name format";

    if (!formData.country.trim()) newErrors.country = "Country is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone number";

    if (!formData.from_date_time) newErrors.from_date_time = "Start date is required";
    if (!formData.to_date_time) newErrors.to_date_time = "End date is required";
    else if (formData.from_date_time > formData.to_date_time)
      newErrors.to_date_time = "End date must be after start date";

    if (formData.pricing_method === "monthly" && getDaysBetween(formData.from_date_time, formData.to_date_time) < 30)
      newErrors.to_date_time = "Minimum 30 days required for monthly pricing";

    if (formData.payment_method === "momo_rwanda") {
      if (!formData.momo_number.trim()) newErrors.momo_number = "MoMo number is required";
      else if (!momoRegex.test(formData.momo_number))
        newErrors.momo_number = "MoMo number must be in format 2507XXXXXXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOtp = async () => {
    if (!validateForm()) return;
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

  const days = getDaysBetween(formData.from_date_time, formData.to_date_time);
  const canContinueForm =
    formData.names &&
    formData.email &&
    formData.from_date_time &&
    formData.to_date_time &&
    (formData.pricing_method !== "monthly" || days >= 30);

  return (
    <Dialog open={isOpen} onClose={closeModal} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white max-w-md w-full rounded-lg shadow-lg p-6 relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
          >
            &times;
          </button>

          {step === "form" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black">Book Apartment</h2>
              <input type="text" name="names" placeholder="Full Name" value={formData.names} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
              {errors.names && <p className="text-red-500 text-sm">{errors.names}</p>}
              <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              <label className="block"><span className="text-black">Pricing Method</span>
                <select name="pricing_method" value={formData.pricing_method} onChange={handleInputChange} className="w-full p-2 border rounded text-black">
                  <option value="daily">Per Day</option>
                  <option value="monthly">Per Month</option>
                </select>
              </label>
              <label className="block">
                <span className="text-black">From</span>
                <input type="date" name="from_date_time" value={formData.from_date_time} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
                {errors.from_date_time && <p className="text-red-500 text-sm">{errors.from_date_time}</p>}
              </label>
              <label className="block">
                <span className="text-black">To</span>
                <input type="date" name="to_date_time" value={formData.to_date_time} onChange={handleInputChange} className="w-full p-2 border rounded text-black" />
                {errors.to_date_time && <p className="text-red-500 text-sm">{errors.to_date_time}</p>}
              </label>
              {selectedDuration && <div className="text-sm text-gray-700">Duration: <strong>{selectedDuration}</strong></div>}
              <div className="text-black font-semibold">Total Price: {totalPrice.toLocaleString()} $</div>
              <div className="flex justify-between">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-black rounded">Cancel</button>
                <button onClick={() => validateForm() && setStep("payment")} disabled={!canContinueForm} className={`px-4 py-2 rounded text-white ${!canContinueForm ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>Continue to Payment</button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black">Choose Payment Method</h2>
              <label className="block">
                <span className="text-black">Payment Method</span>
                <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="w-full p-2 border rounded mt-1 text-black">
                  <option value="">-- Select Payment Method --</option>
                  <option value="momo_rwanda">MOMO (MTN Rwanda)</option>
                  <option value="flutterwave">Flutterwave (MOMO, Airtel, Card, Bank Transfer)</option>
                </select>
              </label>
              {formData.payment_method === "momo_rwanda" && (
                <div>
                  <label className="block">
                    <span className="text-black">MoMo Phone Number</span>
                    <input type="number" name="momo_number" placeholder="2507XXXXXXXX" value={formData.momo_number} onChange={(e) => handleInputChange({ name: "momo_number", value: e.target.value })} className="w-full p-2 border rounded text-black" />
                    {errors.momo_number && <p className="text-red-500 text-sm">{errors.momo_number}</p>}
                    <textarea name="extra_note" placeholder="Additional Notes (optional)" value={formData.extra_note} onChange={(e) => handleInputChange({ name: "extra_note", value: e.target.value })} className="w-full p-2 border rounded text-black mt-2" />
                  </label>
                </div>
              )}
              <div className="flex justify-between">
                <button onClick={() => setStep("form")} className="px-4 py-2 bg-gray-300 text-black rounded">Back</button>
                <button onClick={sendOtp} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{isSending ? "Sending OTP..." : "Send OTP"}</button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black">Enter OTP</h2>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-2 border rounded text-black" placeholder="Enter OTP" />
              <div className="flex justify-between">
                <button onClick={() => setStep("payment")} className="px-4 py-2 bg-gray-300 text-black rounded">Back</button>
                <button onClick={verifyOtp} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{isVerifying ? "Verifying..." : "Verify OTP"}</button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center text-green-600 font-semibold">Booking successful! 🎉</div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
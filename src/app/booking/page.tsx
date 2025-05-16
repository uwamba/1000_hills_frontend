"use client";

import React, { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const BookingForm = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        property_id: "",
    });

    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"form" | "otp" | "success">("form");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = () => {
        setShowModal(true);
        setStep("form");
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            full_name: "",
            email: "",
            phone: "",
            property_id: "",
        });
        setOtp("");
        setStep("form");
    };

    const sendOtp = async () => {
        try {
            setIsSending(true);
            const res = await fetch(`${apiUrl}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Failed to send OTP:", errorData);
                throw new Error("Failed to send OTP");
            }

            setStep("otp");
        } catch (err) {
            alert("Error sending OTP");
            console.error("Error:", err);
        } finally {
            setIsSending(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setIsVerifying(true);
            const res = await fetch(`${apiUrl}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            if (!res.ok) {
                throw new Error("Invalid OTP");
            }

            const bookingRes = await fetch(`${apiUrl}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!bookingRes.ok) {
                throw new Error("Booking failed");
            }

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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Book Visit
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
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Book a Visit</h2>
                                <input
                                    type="text"
                                    name="full_name"
                                    placeholder="Full Name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded mb-4"
                                />
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
                            <div className="bg-yellow-50 p-4 rounded">
                                <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
                                <p className="text-sm text-gray-600 mb-3">
                                    Code sent to <strong>{formData.email}</strong>
                                </p>
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
                                    className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {isVerifying ? "Verifying..." : "Verify & Book"}
                                </button>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="text-center p-4">
                                <h2 className="text-xl font-bold text-green-700 mb-2">
                                    Booking Confirmed!
                                </h2>
                                <p className="text-gray-600">We'll be in touch shortly.</p>
                                <button
                                    onClick={closeModal}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

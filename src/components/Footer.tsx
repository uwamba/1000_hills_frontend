"use client";

import { useState } from "react";

export default function Footer() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <footer className="bg-blue-800 text-white py-6 mt-10 relative z-10">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm sm:text-base mb-2 sm:mb-0">
          © 2025 Visit Liva Trip. All rights reserved.
        </p>
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-blue-100 font-semibold transition duration-200"
        >
          Chat with Us
        </button>
      </div>

      {/* Chat Modal at Bottom-Right */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white w-80 sm:w-96 p-4 rounded-lg shadow-lg border border-gray-300 text-black relative">
            {/* Close Button */}
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-3 text-blue-800">Live Chat</h2>

            {/* Chat Content Area */}
            <div className="h-40 overflow-y-auto border border-gray-200 rounded p-2 mb-3 text-sm">
              <p className="text-gray-600 italic">Chat started. How can we help you today?</p>
            </div>

            {/* Message Input */}
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}

import React from "react";

export default function ThankYou() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow p-8 rounded text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">🎉 Thank you!</h1>
        <p className="text-gray-600">Your form has been successfully submitted.</p>
      </div>
    </div>
  );
}

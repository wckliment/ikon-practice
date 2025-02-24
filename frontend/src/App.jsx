import React from "react";
import "./index.css"; // Ensure Tailwind is applied

export default function App() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Tailwind is working! 🎉
      </h1>
      <p className="text-lg text-gray-700">
        If you see this styled text, Tailwind is correctly installed.
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ErrorModal from "../components/ErrorModal"; // Ensure import is correct

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsModalOpen(true);
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation
    if (!validateForm()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (res.data.token) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-[#EBEAE6] font-nunito">
      {/* Top-Left Logo */}
      <div className="absolute top-8 left-10 flex items-center">
        <img src="/logo.svg" alt="ikon Practice Logo" className="w-10 h-10" />
        <span className="ml-2 text-xl font-semibold text-gray-800">ikon Practice</span>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-lg">
        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 text-sm mt-1">Sign in to get started.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#5A5656] text-white py-2 rounded-md hover:bg-[#4a4747] transition duration-200"
          >
            Log in
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-gray-800 font-semibold hover:underline">
            Sign up here
          </a>
        </p>
      </div>

      {/* Error Modal */}
      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={error} />
    </div>
  );
}


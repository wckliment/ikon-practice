import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ErrorModal from "../components/ErrorModal"; // Ensure correct import

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "dentist", // Default role selection
    dob: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required.");
      setIsModalOpen(true);
      return false;
    }
    if (!formData.role) {
      setError("Please select a role.");
      setIsModalOpen(true);
      return false;
    }
    if (!formData.dob) {
      setError("Date of Birth is required.");
      setIsModalOpen(true);
      return false;
    }
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
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      if (res.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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

      {/* Signup Container */}
      <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-lg">
        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Sign up</h2>
          <p className="text-gray-600 text-sm mt-1">
            Create an account to unlock the full power of ikon Practice.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your full name"
            />
          </div>

          {/* Role Dropdown */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
              Select Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="dentist">Dentist</option>
              <option value="staff">Staff</option>
              <option value="hygienist">Hygienist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
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

          {/* Password */}
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
              placeholder="Create a password"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-[#5A5656] text-white py-2 rounded-md hover:bg-[#4a4747] transition duration-200"
          >
            Sign up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Login Link */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-gray-800 font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </div>

      {/* Error Modal */}
      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={error} />
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../redux/authActions";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(handleLogin(email, password));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#EBEAE6] font-nunito">
      <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-start mb-6">
          <img src="/logo.svg" alt="ikon Practice Logo" className="w-12" />
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 text-sm mt-1">Sign in to get started.</p>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              Remember me
            </label>
            <a href="#" className="hover:underline">
              Forgot password?
            </a>
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
    </div>
  );
}

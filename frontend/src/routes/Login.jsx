import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../redux/authActions";
import ErrorModal from "../components/ErrorModal";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) setIsErrorOpen(true);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(handleLogin(email, password));
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-[#EBEAE6] font-nunito">
      {/* Top-Left Logo */}
      <div className="absolute top-8 left-10 flex items-center">
        <img src="/logo.svg" alt="ikon Practice Logo" className="w-10 h-10" />
        <span className="ml-2 text-xl font-semibold text-gray-800">ikon Practice</span>
      </div>

      {/* Error Modal */}
      <ErrorModal isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} message={error} />

      {/* Login Container */}
      <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 text-sm mt-1">Sign in to get started.</p>
        </div>

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

          <button
            type="submit"
            className="w-full bg-[#5A5656] text-white py-2 rounded-md hover:bg-[#4a4747] transition duration-200"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}


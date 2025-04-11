import { useState } from "react";
import axios from "axios";

const TabletLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/tablet/login", { email, password });

      // ✅ Store the token in localStorage
      localStorage.setItem("tabletToken", res.data.token);

      // ✅ Pass user info back to parent
      onLogin(res.data.user);
    } catch (err) {
      console.error("❌ Tablet login failed:", err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* 👇 ikonFlow Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          ikonFlow
        </h1>
      </div>

      {/* 🖥️ Login Card */}
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md text-center">
        

        <form onSubmit={handleLogin}>
          <input
            className="w-full mb-3 p-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-600 mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default TabletLogin;

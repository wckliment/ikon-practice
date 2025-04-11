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
    <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Tablet Login</h2>

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
  );
};

export default TabletLogin;

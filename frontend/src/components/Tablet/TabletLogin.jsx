import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TabletLogin = ({ onLogin }) => {
  const [step, setStep] = useState("location"); // 👈 NEW
  const [locationCode, setLocationCode] = useState("");
  const [location, setLocation] = useState(null); // 👈 NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔍 Step 1: Validate Location Code
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.get(`/api/locations/by-code/${locationCode}`);
      setLocation(res.data);
      localStorage.setItem("location", JSON.stringify(res.data)); // ✅ Store for use elsewhere
      setStep("login");
    } catch (err) {
      console.error("❌ Invalid location code:", err);
      setError("Location not found. Please try again.");
    }
  };

  const navigate = useNavigate();

  // 🔐 Step 2: Login as tablet user
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await axios.post("/api/tablet/login", { email, password });

    console.log("✅ Login success:", res.data);

    localStorage.setItem("tabletToken", res.data.token);

    const user = res.data.user;

    if (!user?.location_code) {
      console.error("❌ Login response missing location_code");
      setError("Missing location code.");
      return;
    }

    // ✅ Save for use in FillCustomForm and check-in steps
    localStorage.setItem("tabletLocationCode", user.location_code);

    // ✅ Navigate to tablet check-in screen
    navigate(`/tablet-checkin/${user.location_code}`);

    // Optional callback
    if (onLogin) {
      onLogin(user);
    }
  } catch (err) {
    console.error("❌ Tablet login failed:", err);
    setError("Invalid credentials. Please try again.");
  }
};



   // 🔍 Add debug log here:
  console.log("🧪 Current step:", step);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          ikonFlow
        </h1>
      </div>

      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md text-center">
        {step === "location" ? (
          <form onSubmit={handleLocationSubmit}>
            <h2 className="text-lg font-semibold mb-4">Enter Location Code</h2>
            <input
              className="w-full mb-3 p-2 border rounded"
              type="text"
              placeholder="e.g. relaxation"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
            />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h2 className="text-lg font-semibold mb-4">
              {location?.name} Staff Login
            </h2>
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
        )}
      </div>
    </div>
  );
};


export default TabletLogin;

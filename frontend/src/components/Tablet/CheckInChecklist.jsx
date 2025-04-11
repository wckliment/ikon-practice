import { useState, useEffect } from "react";
import axios from "axios";

const CheckInChecklist = ({ patient, appointment, locationCode, onComplete }) => {
  const [formsCompleted, setFormsCompleted] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReady = formsCompleted && paymentCollected && contactVerified;

  const handleCompleteCheckIn = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("tabletToken");

      await axios.post(
        "/api/tablet/tablet-checkin",
        {
          patient,
          appointment,
          locationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onComplete(); // Proceed to the final screen
    } catch (err) {
      console.error("❌ Tablet check-in failed:", err);
      setError("Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {/* Branding */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          ikonFlow
        </h1>
        <p className="text-lg text-gray-600 italic">The moment care begins.</p>
      </div>

      {/* Checklist Card */}
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold mb-6">Check-In Checklist</h2>

        <ChecklistItem
          label="Patient Forms Completed"
          checked={formsCompleted}
          onToggle={() => setFormsCompleted((prev) => !prev)}
        />
        <ChecklistItem
          label="Payment Collected"
          checked={paymentCollected}
          onToggle={() => setPaymentCollected((prev) => !prev)}
        />
        <ChecklistItem
          label="Contact Info Verified"
          checked={contactVerified}
          onToggle={() => setContactVerified((prev) => !prev)}
        />

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <button
          onClick={handleCompleteCheckIn}
          className={`mt-8 w-full py-3 rounded ${
            isReady
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isReady || loading}
        >
          {loading ? "Submitting..." : "Complete Check-In"}
        </button>
      </div>
    </div>
  );
};

const ChecklistItem = ({ label, checked, onToggle }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (checked) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 500); // Reset after bounce
      return () => clearTimeout(timeout);
    }
  }, [checked]);

  return (
    <div
      className="flex items-center justify-between px-4 py-3 mb-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors duration-200"
      onClick={onToggle}
    >
      <span className="text-lg">{label}</span>

      <div className="w-6 h-6 relative flex items-center justify-center">
        <svg
          className={`w-5 h-5 text-green-600 transform transition-all duration-300 ease-in-out ${
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          } ${animate ? "animate-bounce-smooth" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        <div
          className={`absolute w-6 h-6 rounded-full border-2 transition-colors duration-300 ${
            checked ? "border-green-600" : "border-gray-400"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default CheckInChecklist;

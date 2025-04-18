import { useState } from "react";
import axios from "axios";

const PatientLookupForm = ({ locationCode, onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("tabletToken");

      const res = await axios.post(
        "/api/tablet/patient-lookup",
        {
          firstName,
          lastName,
          dob,
          locationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { patient, appointment } = res.data;

      console.log("✅ Lookup Result:");
      console.log("Patient:", patient);
      console.log("Appointment:", appointment);
      console.log("👉 appointment.startTime:", appointment.startTime);

      if (patient && appointment) {
        onSuccess(patient, appointment);
      } else {
        setError("Patient not found for today’s appointments.");
      }
    } catch (err) {
      console.error("❌ Lookup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* 👇 ikonFlow Branding */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          ikonFlow
        </h1>
        <p className="text-lg text-gray-600 mt-1 italic">The moment care begins.</p>
      </div>

      {/* 🧾 Lookup Form */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Patient Check In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 border rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 border rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <div>
  <label htmlFor="dob" className="block text-left text-sm font-medium text-gray-700 mb-1">
    Date of Birth
  </label>
  <input
    id="dob"
    type="date"
    className="w-full p-3 border rounded"
    value={dob}
    onChange={(e) => setDob(e.target.value)}
    required
  />
</div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "Find My Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientLookupForm;

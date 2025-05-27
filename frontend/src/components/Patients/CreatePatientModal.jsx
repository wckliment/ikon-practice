import React from "react";
import axios from "axios";

export default function CreatePatientModal({
  onClose,
  onPatientCreated,
  prefill,
  isLinkMode
}) {

  const safePrefill = prefill || {};

   const [FName, setFName] = React.useState(safePrefill.firstName || "");
  const [LName, setLName] = React.useState(safePrefill.lastName || "");
  const [Phone, setPhone] = React.useState(safePrefill.phone || "");
  const [Email, setEmail] = React.useState(safePrefill.email || "");
  const [Birthdate, setBirthdate] = React.useState("");
  const [Gender, setGender] = React.useState("");


  const handleSubmit = async () => {
    try {
      const genderMap = { M: "Male", F: "Female", U: "Unknown" };
      const res = await axios.post("/api/patients", {
        FName,
        LName,
        Phone,
        Email,
        Gender: genderMap[(Gender || "U").toUpperCase()],
        ...(Birthdate ? { Birthdate } : {}),

      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      onPatientCreated(res.data); // 💥 pass new patient back to parent
      onClose(); // 🎉 close modal
    } catch (err) {
      console.error("❌ Error creating patient", err);
      alert("Failed to create patient");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >✕</button>

        <h2 className="text-2xl font-bold mb-4">
  {isLinkMode ? "Link to Existing Patient" : "Create New Patient"}
</h2>

        <div className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="First Name" value={FName} onChange={(e) => setFName(e.target.value)} className="border rounded px-4 py-2" />
          <input type="text" placeholder="Last Name" value={LName} onChange={(e) => setLName(e.target.value)} className="border rounded px-4 py-2" />
          <input type="text" placeholder="Phone" value={Phone} onChange={(e) => setPhone(e.target.value)} className="border rounded px-4 py-2" />
          <input type="email" placeholder="Email" value={Email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-4 py-2" />
          <input type="date" value={Birthdate} onChange={(e) => setBirthdate(e.target.value)} className="border rounded px-4 py-2" />
          <select value={Gender} onChange={(e) => setGender(e.target.value)} className="border rounded px-4 py-2">
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="U">Unknown</option>
          </select>
        </div>

        <button onClick={handleSubmit} className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Create Patient
        </button>
      </div>
    </div>
  );
}

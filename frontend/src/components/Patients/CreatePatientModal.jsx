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

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [searching, setSearching] = React.useState(false);

  // 🔍 Live search for existing patients
  React.useEffect(() => {
    if (!isLinkMode || searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/patients/search?search=${encodeURIComponent(searchTerm)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const results = res.data.map((pat) => ({
          label: `${pat.FName} ${pat.LName} (${pat.Birthdate || "no DOB"})`,
          value: pat.PatNum,
          patient: pat,
        }));
        setSearchResults(results);
      } catch (err) {
        console.error("❌ Error searching patients:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, isLinkMode]);

  const handleSubmit = async () => {
    try {
      if (isLinkMode) {
        if (!selectedPatient) {
          alert("Please select a patient to link.");
          return;
        }

        onPatientCreated(selectedPatient.patient);
        onClose();
        return;
      }

      const genderMap = { M: "Male", F: "Female", U: "Unknown" };
      const res = await axios.post(
        "/api/patients",
        {
          FName,
          LName,
          Phone,
          Email,
          Gender: genderMap[(Gender || "U").toUpperCase()],
          ...(Birthdate ? { Birthdate } : {}),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      onPatientCreated(res.data);
      onClose();
    } catch (err) {
      console.error("❌ Error handling patient", err);
      alert("Failed to process patient.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {isLinkMode ? "Link to Existing Patient" : "Create New Patient"}
        </h2>

        {isLinkMode ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Search for Existing Patient
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full border rounded px-4 py-2"
            />
            {searching && (
              <p className="text-xs text-gray-500 mt-1">Searching...</p>
            )}
            {searchResults.length > 0 && (
              <select
                className="mt-2 w-full border rounded px-4 py-2"
                value={selectedPatient?.value || ""}
                onChange={(e) => {
                  const match = searchResults.find(
                    (r) => r.value.toString() === e.target.value
                  );
                  setSelectedPatient(match);
                }}
              >
                <option value="">Select a match...</option>
                {searchResults.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={FName}
              onChange={(e) => setFName(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={LName}
              onChange={(e) => setLName(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={Phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <input
              type="date"
              value={Birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <select
              value={Gender}
              onChange={(e) => setGender(e.target.value)}
              className="border rounded px-4 py-2"
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="U">Unknown</option>
            </select>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {isLinkMode ? "Link Patient" : "Create Patient"}
        </button>
      </div>
    </div>
  );
}

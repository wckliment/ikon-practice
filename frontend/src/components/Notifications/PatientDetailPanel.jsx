import React, { useState, useEffect } from "react";
import axios from "axios";


const PatientDetailPanel = ({
  selectedRequest,
  staffNotes,
  setStaffNotes,
  newStaffNote,
  setNewStaffNote,
  handleUpdateRequest,
  setSelectedRequest,
}) => {
  if (!selectedRequest) return null;

  const {
    name,
    phone,
    email,
    appointment_type,
    created_at,
    status,
  } = selectedRequest;

  const [localStatus, setLocalStatus] = useState(selectedRequest.status || "");
  const [forms, setForms] = useState({ completed: [], pending: [] });
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [method, setMethod] = useState("text");

  // ⏱ Sync local status with selectedRequest when changed
useEffect(() => {
  setLocalStatus(selectedRequest.status || "");
}, [selectedRequest]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    await handleUpdateRequest(selectedRequest.id, { status: newStatus });

    // 🧠 Update local selectedRequest with new status
    setSelectedRequest({
      ...selectedRequest,
      status: newStatus,
    });
  };


const fetchForms = async () => {
  if (!selectedRequest?.patient_id) {
    console.warn("⚠️ No patient_id found, skipping forms fetch.");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const [completedRes, pendingRes] = await Promise.all([
      axios.get(`/api/forms/submissions/patient/${selectedRequest.patient_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`/api/custom-form-tokens/patient/${selectedRequest.patient_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    console.log("✅ Completed Forms:", completedRes.data);
    console.log("🕓 Pending Forms:", pendingRes.data);

    setForms({
      completed: completedRes.data || [],
      pending: pendingRes.data || [],
    });
  } catch (err) {
    console.error("❌ Failed to fetch forms for patient:", err);
  }
};

  useEffect(() => {
  fetchForms();
}, [selectedRequest]);

useEffect(() => {
  const fetchAvailableForms = async () => {
    try {
      const res = await axios.get("/api/forms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("📋 Available forms fetched:", res.data);
      setAvailableForms(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch form templates", err);
    }
  };

  fetchAvailableForms();
}, []);



  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 bg-white border-l border-gray-300">
      {/* Top: Patient Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-600">
          📞 {phone || "N/A"} | ✉️ {email || "N/A"}
        </p>
        <p className="text-sm text-gray-600 mt-2">🦷 {appointment_type || "N/A"}</p>
        <p className="text-xs text-gray-500">
          🗓️ Requested: {new Date(created_at).toLocaleString()}
        </p>
      </div>

      {/* Middle: Staff Notes */}
      {staffNotes && staffNotes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Staff Notes</h3>
          <div className="space-y-2 text-sm">
            {staffNotes.map((note) => (
              <div key={note.id} className="bg-gray-100 p-2 rounded-md">
                <div className="text-xs text-gray-500 mb-1">
                  {note.user_name} • {new Date(note.created_at).toLocaleString()}
                </div>
                <div className="text-gray-700">{note.note_text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Note + Status Section */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Add Note</h3>
        <textarea
          value={newStaffNote}
          onChange={(e) => setNewStaffNote(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          rows={3}
          placeholder="Add a new note..."
        />
        <button
          disabled={!newStaffNote.trim()}
          onClick={() => {
            setNewStaffNote("");
            handleUpdateRequest(); // only note is updated
          }}
          className={`mt-2 px-4 py-2 text-sm rounded transition ${
            !newStaffNote.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Save Note
        </button>

        {/* Status Selector */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Update Status</h3>
       <select
  value={localStatus}
  onChange={(e) => {
    const newStatus = e.target.value;
    setLocalStatus(newStatus);
    handleUpdateRequest(selectedRequest.id, { status: newStatus });
  }}
  className="w-[200px] p-2 border rounded text-sm"
>
  <option value="">Select status...</option>
  <option value="pending">Pending</option>
  <option value="contacted">Contacted</option>
  <option value="scheduled">Scheduled</option>
</select>
        </div>


        {/* Forms Section */}
        {/* ➕ Send Form Section */}
<div className="mt-8">
  <h3 className="text-sm font-semibold mb-2 text-gray-700">Send Form</h3>

  {/* Dropdown */}
  <select
    value={selectedFormId}
    onChange={(e) => setSelectedFormId(e.target.value)}
    className="w-full mb-2 p-2 border rounded text-sm"
  >
    <option value="">Select a form...</option>
    {availableForms.map((form) => (
  <option key={form.id} value={form.id}>
    {form.name}
  </option>
))}
  </select>

  {/* Radio Buttons */}
  <div className="flex items-center mb-2 space-x-4 text-sm">
    {["text", "email", "tablet"].map((option) => (
      <label key={option} className="flex items-center space-x-1">
        <input
          type="radio"
          value={option}
          checked={method === option}
          onChange={(e) => setMethod(e.target.value)}
        />
        <span>{option}</span>
      </label>
    ))}
  </div>

  {/* Submit Button */}
  <button
    disabled={!selectedFormId || !method}
onClick={async () => {
  try {
    const payload = {
      patient_id: selectedRequest.patient_id,
      form_id: selectedFormId,
      method,
      location_id: selectedRequest.location_id,
    };

    console.log("📬 Sending form token with payload:", payload);

    await axios.post("/api/custom-form-tokens/generate", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setSelectedFormId("");
    setMethod(""); // optional: reset delivery method
    alert("✅ Form sent!");

    // 📬 Refresh the forms list
    fetchForms();
  } catch (err) {
    console.error("❌ Failed to send form", err);
    alert("Failed to send form.");
  }
}}
    className={`mt-2 px-4 py-2 text-sm rounded transition ${
      !selectedFormId || !method
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700"
    }`}
  >
    ➕ Send Form
  </button>
</div>

      {/* ✅ Insert Forms Section Here */}
        {forms.completed.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Completed Forms</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Form Name</th>
                  <th className="p-2">Submitted</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
               {forms.completed.map((form) => {
  console.log("🧾 Completed form object:", form); // ✅ Now this is valid

  return (
    <tr key={form.id} className="border-t">
      <td className="p-2">{form.form_name}</td>
      <td className="p-2">
        {new Date(form.submitted_at).toLocaleDateString()}
      </td>
<td className="p-2 space-x-2">
  {form.submission_id ? (
    <a
      href={`/api/forms/submissions/${form.submission_id}/pdf`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline"
    >
      View
    </a>
  ) : (
    <span className="text-red-500 text-xs">Missing ID</span>
  )}

<button
  onClick={async () => {
    try {
      await axios.post(
        `/api/forms/submissions/${form.submission_id}/upload`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("✅ Uploaded to Imaging");
    } catch (err) {
      console.error("❌ Upload failed", err);
      alert("Failed to upload.");
    }
  }}
  className="text-green-600 underline"
>
  Upload
</button>

</td>

    </tr>
  );
})}
              </tbody>
            </table>
          </div>
        )}

        {forms.pending.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Pending Forms</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Form Name</th>
                  <th className="p-2">Issued</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.pending.map((token) => (
                  <tr key={token.id} className="border-t">
                    <td className="p-2">{token.form_name}</td>
                    <td className="p-2">
                      {new Date(token.issued_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/forms/fill/${token.token}`
                          ).then(() => alert("✅ Link copied"))
                        }
                        className="text-blue-600 underline"
                      >
                        Copy Link
                      </button>
                 <button
  onClick={async () => {
    try {
      await axios.delete(`/api/custom-form-tokens/${token.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      setForms((prev) => ({
        ...prev,
        pending: prev.pending.filter((f) => f.id !== token.id),
      }));

      alert("❌ Form canceled");
    } catch (err) {
      console.error("❌ Failed to cancel form", err);
      alert("Failed to cancel.");
    }
  }}
  className="text-red-600 underline"
>
  Cancel
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDetailPanel;

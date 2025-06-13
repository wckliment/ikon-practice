import React, { useState, useEffect } from "react";

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
      </div>
    </div>
  );
};

export default PatientDetailPanel;

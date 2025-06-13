import React from "react";

const PatientDetailPanel = ({ selectedRequest }) => {
  if (!selectedRequest) return null;

  const {
    name,
    phone,
    email,
    appointment_type,
    created_at,
    staff_notes,
  } = selectedRequest;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 bg-white border-l border-gray-300">
      {/* Top: Patient Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-600">📞 {phone || "N/A"} | ✉️ {email || "N/A"}</p>
        <p className="text-sm text-gray-600 mt-2">🦷 {appointment_type || "N/A"}</p>
        <p className="text-xs text-gray-500">🗓️ Requested: {new Date(created_at).toLocaleString()}</p>
      </div>

      {/* Middle: Staff Notes */}
      {staff_notes && staff_notes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Staff Notes</h3>
          <div className="space-y-2 text-sm">
            {staff_notes.map((note) => (
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

      {/* Optionally add other summary content here */}
    </div>
  );
};

export default PatientDetailPanel;

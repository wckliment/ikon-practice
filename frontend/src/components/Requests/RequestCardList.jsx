import React from "react";
import PatientTypeIndicator from "../PatientTypeIndicator";

export default function RequestCardList({
  requests,
  setOpenScheduleModal,
  setAppointmentType,
  setSelectedRequest,
  setStaffNotes,
  setOpenFormsPanelPatient,
}) {
  return (
    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
      {requests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Newest first
        .map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <p className="text-xl font-bold text-gray-800 mr-2">{req.name}</p>
                {!!req.has_staff_notes && (
                  <span title="Staff Notes Present" className="text-gray-400 text-lg ml-1">📝</span>
                )}
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${req.status === "pending" ? "bg-yellow-100 text-yellow-800" : req.status === "scheduled" ? "bg-green-100 text-green-800" : req.status === "contacted" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"}`}>{req.status || "Unknown"}</span>
              </div>
              <div className="flex items-center mt-1">
                <PatientTypeIndicator type={req.patient_type} showLabel={true} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {req.preferred_time ? new Date(req.preferred_time).toLocaleDateString(undefined, { dateStyle: "long" }) : "No preferred date"} • {req.appointment_type}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                📞 {req.phone || "N/A"} | ✉️ {req.email || "N/A"}
              </p>
              {req.notes && <p className="text-sm text-gray-400 mt-1 italic">{req.notes}</p>}
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col gap-2">
              {req.status === "scheduled" ? (
                <button
                  disabled
                  className="text-sm px-5 py-2 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Scheduled
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpenScheduleModal(req);
                    setAppointmentType(req.appointment_type || "");
                  }}
                  className="text-sm px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Schedule
                </button>
              )}

              <button
                onClick={async () => {
                  setSelectedRequest(req);
                  try {
                    const res = await axios.get(`/api/appointment-requests/${req.id}/notes?_=${Date.now()}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Cache-Control": "no-cache",
                      },
                    });
                    setStaffNotes(res.data);
                  } catch (err) {
                    console.error("❌ Failed to fetch staff notes:", err);
                    setStaffNotes([]);
                  }
                }}
                className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                View Details
              </button>

              {req.patient_id || req.matchedForm ? (
                <button
                  onClick={() =>
                    setOpenFormsPanelPatient({
                      id: req.patient_id,
                      name: req.name,
                      request: req,
                    })
                  }
                  className="text-sm px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  Forms
                </button>
              ) : (
                <button
                  disabled
                  title="No patient or form found"
                  className="text-sm px-5 py-2 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Forms
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}

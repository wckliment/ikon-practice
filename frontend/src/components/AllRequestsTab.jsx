import React from "react";
import PatientDetailPanel from "./Notifications/PatientDetailPanel.jsx";
import PatientTypeIndicator from "./PatientTypeIndicator";

export default function AllRequestsTab({
  requests,
  selectedRequest,
  setSelectedRequest,
  setOpenScheduleModal,
  setAppointmentType,
})
{
    console.log("📦 Currently selectedRequest:", selectedRequest);
  return (
    <div className="flex w-full h-[calc(100vh-200px)]">
      {/* Left side: requests */}
      <div className="w-1/2 pl-12 pr-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-6">All Requests</h2>
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => {
  console.log("🖱️ Card clicked, setting selectedRequest to:", req);
  setSelectedRequest(req);
}}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="text-xl font-bold text-gray-800 mr-2">{req.name}</p>
                  {!!req.has_staff_notes && (
                    <span className="text-gray-400 text-lg ml-1">📝</span>
                  )}
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    req.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : req.status === "scheduled"
                      ? "bg-green-100 text-green-800"
                      : req.status === "contacted"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {req.status || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <PatientTypeIndicator type={req.patient_type} showLabel />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {req.preferred_time
                    ? new Date(req.preferred_time).toLocaleDateString(undefined, { dateStyle: "long" })
                    : "No preferred date"} • {req.appointment_type}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  📞 {req.phone || "N/A"} | ✉️ {req.email || "N/A"}
                </p>
                {req.notes && (
                  <p className="text-sm text-gray-400 mt-1 italic">{req.notes}</p>
                )}
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (req.status !== "scheduled") {
                      setOpenScheduleModal(req);
                      setAppointmentType(req.appointment_type || "");
                    }
                  }}
                  disabled={req.status === "scheduled"}
                  className={`text-sm px-5 py-2 rounded-lg transition ${
                    req.status === "scheduled"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {req.status === "scheduled" ? "Scheduled" : "Schedule"}
                </button>
                <button
                  disabled
                  className="text-sm px-5 py-2 rounded-lg bg-purple-200 text-purple-700 cursor-default"
                >
                  Forms
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Patient Detail */}
      <div className="w-1/2 border-l border-gray-300 bg-white overflow-y-auto">
        {selectedRequest ? (
          <PatientDetailPanel
            selectedRequest={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}

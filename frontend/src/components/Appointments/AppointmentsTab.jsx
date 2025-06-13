import React from "react";
import axios from "axios";
import PatientTypeIndicator from "../PatientTypeIndicator";

export default function AppointmentsTab({
  requests,
  setOpenScheduleModal,
  setAppointmentType,
  setSelectedRequest,
  setStaffNotes,
  setOpenFormsPanelPatient,
}) {
  const returningRequests = requests.filter(
    (req) => req.patient_type === "returning"
  );

  if (!returningRequests.length) {
    return (
      <div className="mt-10 text-center text-gray-500 text-lg">
        No returning patient appointment requests yet.
      </div>
    );
  }

 return (
  <div className="mt-6 ml-40 max-w-4xl">
    <h2 className="text-2xl font-bold text-gray-800 mb-12 mt-4">
      Returning Patient Appointments
    </h2>
    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
      {returningRequests.map((req) => (
       <div
  key={req.id}
  onClick={() => setSelectedRequest(req)}
  className="cursor-pointer bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg"
>
          <div className="flex-1">
            <div className="flex items-center">
              <p className="text-xl font-bold text-gray-800 mr-2">
                {req.name}
              </p>
              {!!req.has_staff_notes && (
                <span
                  title="Staff Notes Present"
                  className="text-gray-400 text-lg ml-1"
                >
                  📝
                </span>
              )}

              <span
                className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : req.status === "scheduled"
                    ? "bg-green-100 text-green-800"
                    : req.status === "contacted"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {req.status || "Unknown"}
              </span>
            </div>

            <div className="flex items-center mt-1">
              <PatientTypeIndicator type="returning" showLabel={true} />
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {req.preferred_time
                ? new Date(req.preferred_time).toLocaleDateString(undefined, {
                    dateStyle: "long",
                  })
                : "No preferred date"}{" "}
              • {req.appointment_type}
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
              onClick={() => {
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
  className="text-sm px-5 py-2 rounded-lg border border-gray-200 text-gray-400 bg-gray-100 cursor-default"
>
  View Details
</button>

            {/* 📄 Forms Button */}
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
);
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useSelector } from "react-redux";
import procedureOptions from "../constants/procedureOptions";
import appointmentService from "../services/appointmentService";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

const IkonConnect = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openScheduleModal, setOpenScheduleModal] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [operatories, setOperatories] = useState([]);
  const [selectedOperatory, setSelectedOperatory] = useState("");
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const isSaveDisabled = !scheduledDate || !scheduledTime || !selectedProvider || !selectedOperatory;
  const navigate = useNavigate();
  const [searchPatientTerm, setSearchPatientTerm] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);



useEffect(() => {
  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/appointment-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch online requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

const fetchProviders = async () => {
  try {
    const res = await axios.get("/api/providers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    console.log("🚀 Raw provider response:", res.data);
    const data = Array.isArray(res.data.data) ? res.data.data : [];
    setProviders(data);
  } catch (err) {
    console.error("❌ Failed to fetch providers", err);
    setProviders([]);
  }
};

const fetchOperatories = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const locationCode = user?.location_code;

    if (!locationCode) {
      console.warn("⚠️ No location code found in localStorage user object.");
      return;
    }

    const res = await axios.get(`/api/operatories?locationCode=${locationCode}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    const data = Array.isArray(res.data) ? res.data : res.data.data || [];
    setOperatories(data);
    console.log("🏥 Operatories fetched:", data);
  } catch (err) {
    console.error("❌ Failed to fetch operatories", err);
    setOperatories([]);
  }
};

  fetchRequests();
  fetchProviders();
  fetchOperatories();
}, []);





  const handleUpdateRequest = async () => {
    try {
      await axios.put(`/api/appointment-requests/${selectedRequest.id}/status`, {
        status: selectedRequest.status,
        handled_by: user?.id || null,
        staff_notes: selectedRequest.staff_notes,
      });

      const updated = requests.map((r) =>
        r.id === selectedRequest.id ? selectedRequest : r
      );
      setRequests(updated);
      setSelectedRequest(null);
    } catch (err) {
      console.error("❌ Failed to update request:", err);
      alert("Something went wrong.");
    }
  };

useEffect(() => {
  const delayDebounce = setTimeout(async () => {
    if (searchPatientTerm) {
      try {
        setLoadingPatients(true);
        const res = await axios.get(`/api/patients?search=${encodeURIComponent(searchPatientTerm)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        const options = res.data.map((pat) => ({
          label: `${pat.FName} ${pat.LName}`,
          value: pat.PatNum,
        }));

        setPatientOptions(options);
      } catch (err) {
        console.error("❌ Failed to search patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    } else {
      setPatientOptions([]);
    }
  }, 400); // debounce delay (ms)

  return () => clearTimeout(delayDebounce);
}, [searchPatientTerm]);

const handleSaveAppointment = async () => {
  try {
    const formattedDateTime = `${scheduledDate}T${scheduledTime}:00`;

    if (!selectedPatient) {
      alert("❌ Please select a patient before saving!");
      return;
    }

    const appointmentData = {
      patientId: selectedPatient.value, // 👈 Real patient ID
      providerId: selectedProvider,
      aptDateTime: formattedDateTime,
      duration: appointmentDuration,
      operatoryId: selectedOperatory,
      notes: scheduleNotes,
      description: appointmentType,
    };

    console.log("🧠 Appointment data:", appointmentData);

    const response = await appointmentService.createAppointment(appointmentData);

    // ✅ Build a frontend-friendly appointment
    const newAppointment = {
      id: response.data?.id || Math.random(),
      patientName: selectedPatient.label, // 👈 Use selected patient's name
      date: scheduledDate,
      startTime: new Date(formattedDateTime),
      fullStartTime: new Date(formattedDateTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      endTime: new Date(new Date(formattedDateTime).getTime() + appointmentDuration * 60000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      startTimeDate: new Date(formattedDateTime),
      height: appointmentDuration * 2.4,
      duration: appointmentDuration,
      providerId: selectedProvider,
      operatoryId: selectedOperatory,
      staff: providers.find((p) => p.ProvNum === selectedProvider)?.Abbr || "",
      notes: scheduleNotes,
      type: appointmentType,
      status: "Unconfirmed",
      statusColor: "#9ca3af",
      color: "rgb(249, 231, 160)",
    };

    localStorage.setItem("newlyCreatedAppointment", JSON.stringify(newAppointment));

    // ✅ Update request status
    await axios.put(`/api/appointment-requests/${openScheduleModal.id}/status`, {
      status: "scheduled",
      handled_by: user?.id || null,
      staff_notes: scheduleNotes,
    });

    alert("✅ Appointment created and synced with Open Dental!");
    navigate("/appointments");

  } catch (err) {
    console.error("❌ Failed to create appointment:", err);
    alert("Something went wrong while saving the appointment.");
  }
};

  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full">
        <TopBar />
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6 mb-24">
            <h1 className="text-5xl font-bold text-gray-800 -mt-5">ikonConnect</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 text-lg">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex items-center justify-center mt-32">
              <p className="text-gray-500 text-lg">No new requests yet.</p>
            </div>
          ) : (
            <div className="mt-6 ml-40 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-12 mt-4">New Requests</h2>
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-xl font-bold text-gray-800 mr-3">{req.name}</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                        <span className="text-sm font-medium text-indigo-600">
                          {req.patient_type === "new" ? "🆕 New Patient" : "🔁 Returning Patient"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.preferred_time).toLocaleString(undefined, {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}{" "}
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
  setOpenScheduleModal(req);
  setAppointmentType(req.appointment_type || "");
}}
                        className="text-sm px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedRequest.name}</h2>
            <p className="text-sm text-gray-600 mb-2">
              📅 {new Date(selectedRequest.preferred_time).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              🦷 {selectedRequest.appointment_type}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              📞 {selectedRequest.phone} | ✉️ {selectedRequest.email}
            </p>

            <label className="block mt-4 text-sm font-semibold">Staff Notes</label>
            <textarea
              rows="3"
              value={selectedRequest.staff_notes || ""}
              onChange={(e) =>
                setSelectedRequest({ ...selectedRequest, staff_notes: e.target.value })
              }
              className="w-full mt-1 border border-gray-300 rounded-lg p-2"
            ></textarea>

            <label className="block mt-4 text-sm font-semibold">Status</label>
            <select
              value={selectedRequest.status}
              onChange={(e) =>
                setSelectedRequest({ ...selectedRequest, status: e.target.value })
              }
              className="w-full mt-1 border border-gray-300 rounded-lg p-2"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <button
              onClick={handleUpdateRequest}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Request
            </button>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {openScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <button
              onClick={() => setOpenScheduleModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>
<p className="text-sm text-gray-600 mb-2">{openScheduleModal.name}</p>

            <div className="space-y-4">


{/* Patient Search */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Select Patient <span className="text-red-500">*</span>
  </label>
  <p className="text-xs text-gray-500 mb-2">🔎 Tip: Search by last name first</p>
  <ReactSelect
    placeholder="Search patients..."
    isLoading={loadingPatients}
    options={patientOptions}
    onInputChange={(input) => setSearchPatientTerm(input)}
    onChange={(selected) => setSelectedPatient(selected)}
    value={selectedPatient}
    className="mb-4"
  />
</div>


  {/* Date */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
    <input
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
    />
  </div>

  {/* Time */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
    <input
        type="time"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
    />
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Duration</label>
  <select
    value={appointmentDuration}
    onChange={(e) => setAppointmentDuration(Number(e.target.value))}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value={15}>15 minutes</option>
    <option value={30}>30 minutes</option>
    <option value={45}>45 minutes</option>
    <option value={60}>60 minutes</option>
    <option value={90}>90 minutes</option>
  </select>
</div>

 {/* Patient's Free Text Request (Read-only View) */}
{openScheduleModal.appointment_type && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Request</label>
    <div className="p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800">
      {openScheduleModal.appointment_type}
    </div>
  </div>
)}

{/* Staff-selectable Procedure Dropdown */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Procedure <span className="text-red-500">*</span>
  </label>
  <select
    value={appointmentType}
    onChange={(e) => setAppointmentType(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
    required
  >
    <option value="">Select Procedure…</option>
    {procedureOptions.map((procedure) => (
      <option key={procedure.value} value={procedure.value}>
        {procedure.label}
      </option>
    ))}
  </select>
</div>

              {/* Provider Dropdown */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
  <select
    value={selectedProvider}
    onChange={(e) => setSelectedProvider(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="">Select Provider…</option>
    {providers.map((provider) => (
      <option key={provider.ProvNum} value={provider.ProvNum}>
        {provider.LName}, {provider.FName}
      </option>
    ))}
  </select>
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Operatory</label>
  <select
    value={selectedOperatory}
    onChange={(e) => setSelectedOperatory(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="">Select Operatory…</option>
    {operatories.map((op) => (
      <option key={op.OperatoryNum} value={op.OperatoryNum}>
        {op.OpName}
      </option>
    ))}
  </select>
</div>

  {/* Notes or Provider */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Provider / Notes</label>
    <input
     type="text"
     value={scheduleNotes}
    onChange={(e) => setScheduleNotes(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
     placeholder="please provide any additional information for the provider"
    />
  </div>
</div>

<button
  onClick={handleSaveAppointment}
  disabled={isSaveDisabled}
  className={`mt-6 w-full py-2 rounded-lg transition ${
    isSaveDisabled
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-600 text-white hover:bg-green-700"
  }`}
>
  Save Appointment
</button>

          </div>
        </div>
      )}
    </div>
  );
};

export default IkonConnect;

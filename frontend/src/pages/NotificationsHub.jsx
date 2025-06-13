import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useSelector } from "react-redux";
import axios from "axios";
import ReactSelect from "react-select";
import procedureOptions from "../constants/procedureOptions";
import appointmentService from "../services/appointmentService";
import { socket, connectSocket } from "../socket";
import FormsTab from "../components/Forms/FormsTab";
import AppointmentsTab from "../components/Appointments/AppointmentsTab";
import PatientTypeIndicator from "../components/PatientTypeIndicator";
import FormsSidePanel from "../components/Forms/FormsSidePanel";
import AllRequestsTab from "../components/AllRequestsTab";
import PatientDetailPanel from "../components/Notifications/PatientDetailPanel";

const NotificationsHub = () => {
const [scheduledDate, setScheduledDate] = useState("");
const [scheduledTime, setScheduledTime] = useState("");
const [appointmentDuration, setAppointmentDuration] = useState(30);
const [appointmentType, setAppointmentType] = useState("");
const [selectedProvider, setSelectedProvider] = useState("");
const [selectedPatient, setSelectedPatient] = useState(null);
const [scheduleNotes, setScheduleNotes] = useState("");
const [operatories, setOperatories] = useState([]);
const [providers, setProviders] = useState([]);
const [patientOptions, setPatientOptions] = useState([]);
const [searchPatientTerm, setSearchPatientTerm] = useState("");
const [loadingPatients, setLoadingPatients] = useState(false);
const [openScheduleModal, setOpenScheduleModal] = useState(null);
const [activeTab, setActiveTab] = useState("new-patients");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
const [newStaffNote, setNewStaffNote] = useState("");
const [staffNotes, setStaffNotes] = useState([]);
const [showNewPatientModal, setShowNewPatientModal] = useState(false);
const [selectedOperatory, setSelectedOperatory] = useState("");
const isSaveDisabled =
  !scheduledDate ||
  !scheduledTime ||
  !selectedProvider ||
  !selectedPatient ||
  !appointmentType ||
  !scheduleNotes;
const [requests, setRequests] = useState([]);
const user = useSelector((state) => state.auth.user);
const [newPatientFirstName, setNewPatientFirstName] = useState("");
const [newPatientLastName, setNewPatientLastName] = useState("");
const [newPatientPhone, setNewPatientPhone] = useState("");
const [newPatientEmail, setNewPatientEmail] = useState("");
const [newPatientBirthdate, setNewPatientBirthdate] = useState("");
const [newPatientGender, setNewPatientGender] = useState("");
const [openFormsPanelPatient, setOpenFormsPanelPatient] = useState(null);

const fetchRequests = async () => {
  try {
    const [requestsRes, matchedFormsRes] = await Promise.all([
      axios.get("/api/appointment-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
      axios.get("/api/form-submissions/unlinked/match"),
    ]);

    const mergedRequests = requestsRes.data.map((request) => {
      const matchedForm = matchedFormsRes.data.find(
        (form) => form.request_id === request.id
      );
      return {
        ...request,
        matchedForm: matchedForm || null,
      };
    });

    setRequests(mergedRequests);
  } catch (err) {
    console.error("❌ Failed to fetch appointment requests or matched forms", err);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  connectSocket(localStorage.getItem("token") || "");

  fetchRequests();

  const fetchProviders = async () => {
    try {
      const res = await axios.get("/api/providers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProviders(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch providers", err);
    }
  };



const fetchOperatories = async () => {
  try {
    const locationCode = user?.location_code;

    if (!locationCode) {
      console.warn("⚠️ location_code missing from user object");
      return;
    }

    console.log("📡 Fetching operatories for location:", locationCode);

    const res = await axios.get(`/api/operatories?locationCode=${locationCode}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    console.log("✅ Operatories response:", res.data); // <-- log this

    setOperatories(res.data || []);
  } catch (err) {
    console.error("❌ Failed to fetch operatories", err);
  }
};

  fetchRequests();
  fetchProviders();
  fetchOperatories();

  socket.on("newAppointmentRequest", (newRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
  });

  return () => {
    socket.off("newAppointmentRequest");
  };
}, []);

useEffect(() => {
  if (activeTab === "all" && selectedRequest?.id) {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`/api/staff-notes/${selectedRequest.id}`);
        setStaffNotes(response.data);
      } catch (err) {
        console.error("Failed to fetch staff notes:", err);
      }
    };
    fetchNotes();
  }
}, [activeTab, selectedRequest]);



// 🔍 Debounced patient search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchPatientTerm) {
        try {
          setLoadingPatients(true);
          const res = await axios.get(`/api/patients/search?search=${encodeURIComponent(searchPatientTerm)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          });

          const options = res.data.map((pat) => ({
            label: `${pat.FName} ${pat.LName}`,
            value: pat.PatNum,
          }));

          setPatientOptions(options);
        } catch (err) {
          console.error("❌ Failed to search patients:", err);
          setPatientOptions([]);
        } finally {
          setLoadingPatients(false);
        }
      } else {
        setPatientOptions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchPatientTerm]);


const handleUpdateRequest = async (id = selectedRequest.id, updates = {}) => {
  try {
    const payload = {
      status: updates.status || selectedRequest.status,
      handled_by: user.id,
      staff_notes: newStaffNote.trim() !== "" ? newStaffNote : undefined,
    };

    // 1️⃣ Update the status or staff note
    await axios.put(`/api/appointment-requests/${id}/status`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // 2️⃣ Update local requests array
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: updates.status || req.status,
              has_staff_notes:
                newStaffNote.trim() !== "" || req.has_staff_notes,
            }
          : req
      )
    );

    // 3️⃣ Only re-fetch notes if one was submitted
    if (newStaffNote.trim() !== "") {
      const res = await axios.get(`/api/appointment-requests/${id}/notes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      });
      setStaffNotes(res.data);
      setNewStaffNote("");
    }
  } catch (err) {
    console.error("❌ Failed to update request or fetch notes:", err);
  }
};


const handleSelectRequest = async (req) => {
  try {
    console.log("🖱️ handleSelectRequest triggered for:", req);
    setSelectedRequest(req);

    const res = await axios.get(
      `/api/appointment-requests/${req.id}/notes?_=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      }
    );

    setStaffNotes(res.data);
  } catch (err) {
    console.error("❌ Failed to fetch staff notes in handleSelectRequest:", err);
    setStaffNotes([]);
  }
};


const handleSaveAppointment = async () => {
  try {
    const appointmentData = {
      patientId: selectedPatient.value,
      aptDateTime: `${scheduledDate}T${scheduledTime}`,
      operatoryId: selectedOperatory,
      providerId: selectedProvider,
      notes: scheduleNotes,
      duration: appointmentDuration,
      description: appointmentType,
      procedures: [{ description: appointmentType }],
    };

    console.log("📦 Sending appointment with:", {
      appointmentType,
      procedures: [{ description: appointmentType }],
    });

    await appointmentService.createAppointment(appointmentData);

    // ✅ Step 1: Link this patient to the appointment request
    if (openScheduleModal?.id && selectedPatient?.value) {
      try {
        await axios.put(
          `/api/appointment-requests/${openScheduleModal.id}/link-patient`,
          {
            patient_id: selectedPatient.value,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        console.log("🔗 Successfully linked patient to appointment request");
      } catch (err) {
        console.error("❌ Failed to link patient to request:", err);
      }
    }

    // ✅ Step 2: Reset modal state
    setOpenScheduleModal(null);
    setScheduledDate("");
    setScheduledTime("");
    setAppointmentDuration(30);
    setAppointmentType("");
    setSelectedProvider("");
    setSelectedPatient(null);
    setScheduleNotes("");
    await fetchRequests();
  } catch (err) {
    console.error("❌ Failed to save appointment:", err);
  }
};




  return (
    <>
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full relative">
        <TopBar />
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6">
<h1 className="text-5xl font-bold text-gray-800 -mt-5">Notifications Hub</h1>
<div className="mt-6 flex space-x-4">
  <button
    onClick={() => setActiveTab("all")}
    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
      activeTab === "all"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    All
  </button>
  <button
    onClick={() => setActiveTab("new-patients")}
    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
      activeTab === "new-patients"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    New Patients
  </button>
  <button
    onClick={() => setActiveTab("forms")}
    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
      activeTab === "forms"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Forms
  </button>
  <button
    onClick={() => setActiveTab("appointments")}
    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
      activeTab === "appointments"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Appointments
  </button>
</div>
 </div>
          {activeTab === "new-patients" && (
            isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500 text-lg">Loading requests...</p>
              </div>
            ) : requests.filter(req => req.patient_type === "new").length === 0 ? (
              <div className="flex items-center justify-center mt-32">
                <p className="text-gray-500 text-lg">No new requests yet.</p>
              </div>
            ) : (





                       <div className="flex w-full h-[calc(100vh-200px)]">
      {/* Left side: request cards */}
      <div className="w-1/2 pl-12 pr-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-6">New Requests</h2>
        <div className="space-y-4">
          {requests
            .filter(req => req.patient_type === "new")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((req) => (
              <div
  key={req.id}
  onClick={() => handleSelectRequest(req)}
  className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg cursor-pointer"
>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-xl font-bold text-gray-800 mr-2">{req.name}</p>
                    {!!req.has_staff_notes && (
                      <span title="Staff Notes Present" className="text-gray-400 text-lg ml-1">📝</span>
                    )}
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${req.status === "pending"
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
                    <PatientTypeIndicator type={req.patient_type} showLabel={true} />
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

{/* Forms */}


{req.patient_id || req.matchedForm ? (
  <button
    className="text-sm px-5 py-2 rounded-lg bg-purple-200 text-purple-700 cursor-default"
    disabled
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
      </div>

      {/* Right side: patient detail */}
      <div className="w-1/2 border-l border-gray-300 bg-white overflow-y-auto">
        {selectedRequest ? (
          <PatientDetailPanel
  selectedRequest={selectedRequest}
  onClose={() => setSelectedRequest(null)}
  staffNotes={staffNotes}
  newStaffNote={newStaffNote}
  setNewStaffNote={setNewStaffNote}
  setSelectedRequest={setSelectedRequest}
  handleUpdateRequest={handleUpdateRequest}
/>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  )
)}

      {/* Forms Tab */}
          {activeTab === "forms" && <FormsTab />}

          {activeTab === "appointments" && (
  <div className="flex w-full h-[calc(100vh-200px)]">
    {/* Left Side: Cards */}
    <div className="w-1/2 overflow-y-auto pr-4">
      <AppointmentsTab
        requests={requests
          .filter(r => r.patient_type === "returning")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
        setOpenScheduleModal={setOpenScheduleModal}
        setAppointmentType={setAppointmentType}
        setSelectedRequest={setSelectedRequest}
        setStaffNotes={setStaffNotes}
        setOpenFormsPanelPatient={setOpenFormsPanelPatient}
        handleSelectRequest={handleSelectRequest}
      />
    </div>

    {/* Right Side: Patient Detail */}
    <div className="w-1/2 border-l border-gray-300 bg-white overflow-y-auto">
      {selectedRequest ? (
        <PatientDetailPanel
  selectedRequest={selectedRequest}
  onClose={() => setSelectedRequest(null)}
  staffNotes={staffNotes}
  newStaffNote={newStaffNote}
  setNewStaffNote={setNewStaffNote}
  setSelectedRequest={setSelectedRequest}
  handleUpdateRequest={handleUpdateRequest}
/>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 italic">
          Select a request to view details
        </div>
      )}
    </div>
  </div>
)}

{activeTab === "all" && (
  <AllRequestsTab
    requests={[
      ...requests.filter((r) => !r.patient_id),
      ...requests.filter((r) => r.patient_id),
    ]}
    selectedRequest={selectedRequest}
    handleSelectRequest={handleSelectRequest}
    setOpenScheduleModal={setOpenScheduleModal}
    setAppointmentType={setAppointmentType}
    staffNotes={staffNotes}
    setStaffNotes={setStaffNotes}
    newStaffNote={newStaffNote}
    setNewStaffNote={setNewStaffNote}
    setSelectedRequest={setSelectedRequest}
    handleUpdateRequest={handleUpdateRequest}
  />
)}


        </div>

   {/* View Details Modal disabled in favor of Master–Detail panel */}

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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Patient <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={() => setShowNewPatientModal(true)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Create New Patient
                    </button>
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select Procedure…</option>
                    {procedureOptions.map((procedure) => (
                      <option key={procedure.value} value={procedure.value}>
                        {procedure.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                className={`mt-6 w-full py-2 rounded-lg transition ${isSaveDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                Save Appointment
              </button>
            </div>
          </div>
        )}

          {showNewPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4">New Patient</h2>

              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newPatientFirstName}
                  onChange={(e) => setNewPatientFirstName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newPatientLastName}
                  onChange={(e) => setNewPatientLastName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="date"
                  value={newPatientBirthdate}
                  onChange={(e) => setNewPatientBirthdate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <select
                  value={newPatientGender}
                  onChange={(e) => setNewPatientGender(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="U">Unknown</option>
                </select>
              </div>

<button
  onClick={async () => {
    try {
      const genderMap = {
        M: "Male",
        F: "Female",
        U: "Unknown",
      };

      const res = await axios.post("/api/patients", {
        FName: newPatientFirstName,
        LName: newPatientLastName,
        Phone: newPatientPhone,
        Email: newPatientEmail,
        Birthdate: newPatientBirthdate,
        Gender: genderMap[(newPatientGender || 'U').toUpperCase()] || "Unknown",
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const newPat = res.data;

      // Set selected patient in schedule modal
      setSelectedPatient({
        value: newPat.PatNum,
        label: `${newPat.FName} ${newPat.LName}`,
      });

      setShowNewPatientModal(false);
      setNewPatientFirstName("");
      setNewPatientLastName("");
      setNewPatientPhone("");
      setNewPatientEmail("");
      setNewPatientBirthdate("");
      setNewPatientGender("");

    } catch (err) {
      console.error("❌ Failed to create patient:", err);
      alert("Error creating patient");
    }
  }}
  className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
>
  Create Patient
</button>

            </div>
          </div>

        )}
        </div>
        </div>

{openFormsPanelPatient && (() => {
  const matchedRequest = requests.find(
    (r) => r.patient_id === openFormsPanelPatient.id
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={() => setOpenFormsPanelPatient(null)}
      />

      {/* Panel */}
      <div className="relative w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
        <FormsSidePanel
          patientId={openFormsPanelPatient.id}
          patientName={openFormsPanelPatient.name}
          selectedRequest={matchedRequest}
          matchedForm={matchedRequest?.matchedForm}
          onClose={() => setOpenFormsPanelPatient(null)}
        />
      </div>
    </div>
  );
})()}



        </>
  );
};

export default NotificationsHub;

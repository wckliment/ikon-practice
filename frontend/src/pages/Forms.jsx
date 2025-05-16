import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import axios from "axios";
import ReactSelect from "react-select";
import { formTemplates } from "../data/formTemplates";
import ReconcilliationTab from "../components/ReconcilliationTab";

const Forms = () => {
  const [searchPatientTerm, setSearchPatientTerm] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [forms, setForms] = useState({ completed: [], pending: [] });
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [method, setMethod] = useState("website");
  const [activeTab, setActiveTab] = useState("completed");



  // 🔍 Debounced patient search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchPatientTerm) {
        try {
          setLoadingPatients(true);
          const res = await axios.get(`/api/patients?search=${encodeURIComponent(searchPatientTerm)}`, {
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


  // 📋 Fetch forms for the selected patient
  const fetchForms = async () => {
    if (selectedPatient) {
      try {
        setIsLoadingForms(true);
        const res = await axios.get(`/api/forms/patient/${selectedPatient.value}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });

        setForms(res.data || []);
        setForms((prev) => ({
  completed: prev.completed,
  pending: prev.pending.filter((form) => form.status !== 'completed')
}));
      } catch (err) {
        console.error("❌ Failed to fetch forms:", err);
        setForms([]);
      } finally {
        setIsLoadingForms(false);
      }
    }
  };

  // 📋 Automatically fetch forms when patient is selected
  useEffect(() => {
    fetchForms();
  }, [selectedPatient]);

  useEffect(() => {
    const fetchAvailableForms = async () => {
      if (showSendModal) {
        try {
          const res = await axios.get("/api/forms/sheetdefs", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          });
          setAvailableForms(res.data || []);
        } catch (err) {
          console.error("❌ Failed to fetch form templates:", err);
        }
      }
    };

    fetchAvailableForms();
  }, [showSendModal]);

  const handleSendForm = async () => {
    try {
      if (!selectedFormId || !selectedPatient) return;

      const res = await axios.post(
        "/api/forms/send",
        {
          patNum: selectedPatient.value,
          sheetDefId: selectedFormId,
          method: method,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      alert(`✅ Form sent! Link: ${res.data.link}`);


      setShowSendModal(false);
      setSelectedFormId("");
      setMethod("website");
    } catch (err) {
      console.error("❌ Failed to send form:", err);
      alert("Error sending form. Check console.");
    }
  };

  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full">
        <TopBar />
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6 mb-10">
            <h1 className="text-5xl font-bold text-gray-800 -mt-5">Forms</h1>
          </div>

          {/* 🧠 Patient search */}
          <div className="max-w-md mx-auto mb-10">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Patient
            </label>
            <ReactSelect
              placeholder="Start typing to search patients..."
              isLoading={loadingPatients}
              options={patientOptions}
              onInputChange={(input) => setSearchPatientTerm(input)}
              onChange={(selected) => setSelectedPatient(selected)}
              value={selectedPatient}
            />
            {selectedPatient && (
              <div className="mt-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                  onClick={() => setShowSendModal(true)}
                >
                  + Send Form
                </button>
              </div>
            )}
          </div>

          {/* 📋 Forms Tab Layout */}
          <div className="px-6">
            {isLoadingForms ? (
              <p className="text-center text-gray-500 mt-10">Loading forms...</p>
            ) : selectedPatient ? (
              <>
                {/* 🔀 Tab toggle buttons */}
                <div className="mb-6 flex space-x-4 justify-center">
                  <button
                    className={`px-4 py-2 rounded ${activeTab === "completed"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                      }`}
                    onClick={() => setActiveTab("completed")}
                  >
                    Completed & Pending
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${activeTab === "reconciliation"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                      }`}
                    onClick={() => setActiveTab("reconciliation")}
                  >
                    Reconciliation
                  </button>
                </div>

                {/* 🔁 Conditional tab content */}
                {activeTab === "completed" ? (
                  <div className="max-w-7xl mx-auto flex space-x-10">
                    {/* ✅ Completed Forms Table */}
                    <div className="w-1/2">
                      <h2 className="text-2xl font-bold mb-4">
                        Completed Forms for {selectedPatient.label}
                      </h2>
                      {forms.completed.length === 0 ? (
                        <p className="text-gray-500 text-sm">No completed forms.</p>
                      ) : (
                        <table className="w-full bg-white rounded shadow overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Form Name</th>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Completed</th>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forms.completed.map((form) => (
                              <tr key={form.SheetNum} className="border-t">
                                <td className="px-4 py-2 text-sm">{form.Description}</td>
                                <td className="px-4 py-2 text-sm">
                                  {new Date(form.DateTimeSheet).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => alert("TODO: View form logic")}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* 🕒 Pending Forms Table */}
                    <div className="w-1/2">
                      <h2 className="text-2xl font-bold mb-4">
                        Pending Forms for {selectedPatient.label}
                      </h2>
                      {forms.pending.length === 0 ? (
                        <p className="text-gray-500 text-sm">No pending forms.</p>
                      ) : (
                        <table className="w-full bg-white rounded shadow overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Form ID</th>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Sent</th>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Method</th>
                              <th className="px-4 py-2 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forms.pending.map((form) => (
                              <tr key={form.id} className="border-t">
                                <td className="px-4 py-2 text-sm">{form.sheet_def_id}</td>
                                <td className="px-4 py-2 text-sm">
                                  {new Date(form.sent_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm capitalize">{form.method}</td>
                                <td className="px-4 py-2 text-sm space-x-2">
                                  {form.method === "website" && (
                                    <>
                                      <a
                                        href={`/forms/fill/${form.token}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Open
                                      </a>
                                      <button
                                        onClick={() => {
                                          const origin = window.location.origin || "http://localhost:5173";
                                          const fullUrl = `${origin}/forms/fill/${form.token}`;
                                          navigator.clipboard.writeText(fullUrl);
                                          alert(`🔗 Link copied to clipboard:\n${fullUrl}`);
                                        }}
                                        className="text-blue-600 hover:underline"
                                      >
                                        Copy Link
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="text-red-600 hover:underline"
                                    onClick={async () => {
                                      if (!window.confirm("Are you sure you want to cancel this form?")) return;
                                      try {
                                        await axios.patch(
                                          `/api/forms/${form.id}/cancel`,
                                          {},
                                          {
                                            headers: {
                                              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                                            },
                                          }
                                        );
                                        alert("❌ Form cancelled.");
                                        fetchForms();
                                      } catch (err) {
                                        console.error("Error cancelling form:", err);
                                        alert("Something went wrong. Check console.");
                                      }
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ) : activeTab === "reconciliation" && selectedPatient?.value ? (
                  <ReconcilliationTab patientId={selectedPatient.value} />
                ) : (
                  <p className="text-center text-gray-400 mt-10">
                    Please search and select a patient above.
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-gray-400 mt-10">
                Please search and select a patient above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Send Form Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Send Form to {selectedPatient.label}</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded mb-4 px-3 py-2"
            >
              <option value="website">Website</option>
              <option value="sms">SMS</option>
              <option value="tablet">Tablet</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full border border-gray-300 rounded mb-4 px-3 py-2"
            >
              <option value="">Select a form...</option>
              {availableForms.map((form) => {
                const template = formTemplates[form.Description];
                const isDisabled = template?.openDentalOnly;

                return (
                  <option
                    key={form.SheetDefNum}
                    value={form.SheetDefNum}
                    disabled={isDisabled}
                  >
                    {form.Description} {isDisabled ? " (In-Office Only)" : ""}
                  </option>
                );
              })}
            </select>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowSendModal(false)} className="text-gray-500 hover:underline">
                Cancel
              </button>
              <button
                onClick={handleSendForm}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;

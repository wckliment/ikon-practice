import React, { useEffect, useState } from "react";
import axios from "axios";

const FormsSidePanel = ({ patientId, patientName, matchedForm, onClose }) => {
  const [forms, setForms] = useState({ completed: [], pending: [] });
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [method, setMethod] = useState("website");
  const [showSendModal, setShowSendModal] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  // Fetch completed + pending forms
useEffect(() => {
  const fetchForms = async () => {
    console.log("🔍 Fetching forms for patientId:", patientId);

    try {
      setIsLoadingForms(true);
      const token = localStorage.getItem("token") || "";

      const [completedRes, pendingRes] = await Promise.all([
        axios.get(`/api/forms/submissions/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/custom-form-tokens/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("✅ Completed forms:", completedRes.data);
      console.log("⏳ Pending forms:", pendingRes.data);

      setForms({
        completed: completedRes.data || [],
        pending: pendingRes.data || [],
      });
    } catch (err) {
      console.error("❌ Failed to fetch forms:", err);
      setForms({ completed: [], pending: [] });
    } finally {
      setIsLoadingForms(false);
    }
  };

  if (patientId) fetchForms();
}, [patientId]);

  // Fetch templates for Send Form modal
  useEffect(() => {
    const fetchAvailableForms = async () => {
      try {
        const res = await axios.get("/api/forms", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        setAvailableForms(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch templates:", err);
      }
    };

    if (showSendModal) fetchAvailableForms();
  }, [showSendModal]);

  const handleSendForm = async () => {
    try {
      if (!selectedFormId || !patientId) return;

      const endpoint =
        method === "tablet"
          ? "/api/custom-form-tokens/tablet"
          : "/api/custom-form-tokens/generate";

      const res = await axios.post(
        endpoint,
        {
          form_id: selectedFormId,
          patient_id: patientId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      const { token } = res.data;
      const fullUrl = `${window.location.origin}/forms/custom/${token}`;
      alert(`✅ Form sent! Link: ${fullUrl}`);

      setShowSendModal(false);
      setSelectedFormId("");
      setMethod("website");

      // Refresh
      const completedRes = await axios.get(`/api/forms/submissions/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const pendingRes = await axios.get(`/api/custom-form-tokens/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });

      setForms({
        completed: completedRes.data || [],
        pending: pendingRes.data || [],
      });
    } catch (err) {
      console.error("❌ Error sending form:", err);
      alert("Something went wrong. Check console.");
    }
  };

    const handleUploadToImaging = async (submissionId) => {
  if (!window.confirm("Upload this form to Open Dental Imaging?")) return;

  try {
    await axios.post(
      `/api/forms/submissions/${submissionId}/upload`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );

    alert("✅ Successfully uploaded to Imaging.");
  } catch (err) {
    console.error("❌ Upload failed:", err);
    alert("Failed to upload to Imaging. Check the console for details.");
  }
};


  return <div className="fixed top-0 right-0 w-[550px] h-full bg-white shadow-lg z-50 p-6 overflow-y-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Forms for {patientName}</h2>
      <button onClick={onClose} className="text-gray-500 hover:text-red-600">✕</button>
    </div>

    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
      onClick={() => setShowSendModal(true)}
    >
      + Send Form
    </button>

{matchedForm && (
  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-6">
    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Unlinked Form Found</h3>
    <p className="text-sm text-yellow-700">
      A submitted form from this patient exists, but it has not been linked to their Open Dental record yet.
    </p>
    <div className="mt-3 flex gap-4">
      <button
        className="text-blue-600 hover:underline text-sm"
        onClick={() =>
          window.open(
            `${import.meta.env.VITE_API_BASE_URL}/api/forms/submissions/${matchedForm.form_id}/pdf`,
            "_blank"
          )
        }
      >
        Preview
      </button>

      {/* Optional: Add logic to link form to patient (if not automatic elsewhere) */}
      <button
        className="text-green-600 hover:underline text-sm"
        onClick={async () => {
          if (!window.confirm("Link this form to this patient?")) return;
          try {
            await axios.post(
              `/api/forms/submissions/${matchedForm.form_id}/link`,
              { patient_id: patientId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
              }
            );
            alert("✅ Form linked to patient.");
            window.location.reload(); // or trigger a refresh of completed forms
          } catch (err) {
            console.error("Failed to link form:", err);
            alert("Something went wrong. Check the console.");
          }
        }}
      >
        Link to Patient
      </button>
    </div>
  </div>
)}



    {/* Tab Buttons */}
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setActiveTab("completed")}
        className={`px-4 py-2 rounded ${activeTab === "completed" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
      >
        Completed & Pending
      </button>
    </div>

 {isLoadingForms ? (
  <p className="text-center text-gray-500 mt-10">Loading forms...</p>
) : (
  <>
    {activeTab === "completed" ? (
      <div className="space-y-10">

        {/* ✅ Completed Forms */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Completed Forms for {patientName}
          </h2>
          {forms.completed.length === 0 ? (
            <p className="text-gray-500 text-sm">No completed forms.</p>
          ) : (
            <table className="w-full bg-white rounded shadow overflow-hidden text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Form</th>
                  <th className="px-4 py-2 text-left">Completed</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.completed.map((form) => (
                  <tr key={form.submission_id} className="border-t">
                    <td className="px-4 py-2">{form.form_name}</td>
                    <td className="px-4 py-2">
                      {new Date(form.submitted_at).toLocaleString()}
                    </td>
                   <td className="px-4 py-2 space-x-3">
  <button
    className="text-blue-600 hover:underline"
    onClick={() =>
      window.open(
        `${import.meta.env.VITE_API_BASE_URL}/api/forms/submissions/${form.submission_id}/pdf`,
        "_blank"
      )
    }
  >
    View
  </button>

  <button
    onClick={() => handleUploadToImaging(form.submission_id)}
    className="text-green-600 hover:underline"
  >
    Upload
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 🕒 Pending Forms */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Pending Forms for {patientName}
          </h2>
          {forms.pending.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending forms.</p>
          ) : (
            <table className="w-full bg-white rounded shadow overflow-hidden text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Form</th>
                  <th className="px-4 py-2 text-left">Sent</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.pending.map((form) => (
                  <tr key={form.id} className="border-t">
                    <td className="px-4 py-2">{form.form_name}</td>
                    <td className="px-4 py-2">
                      {new Date(form.issued_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 capitalize">{form.method}</td>
                    <td className="px-4 py-2 space-x-2">
                      <a
                        href={`/forms/custom/${form.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/forms/custom/${form.token}`;
                          navigator.clipboard.writeText(fullUrl);
                          alert(`🔗 Link copied:\n${fullUrl}`);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Cancel this form?")) return;
                          try {
                            await axios.delete(`/api/custom-form-tokens/${form.id}`, {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                              },
                            });
                            alert("❌ Form cancelled.");
                            fetchForms();
                          } catch (err) {
                            console.error("Error cancelling form:", err);
                            alert("Something went wrong.");
                          }
                        }}
                        className="text-red-600 hover:underline"
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
    ) : (
      <p className="text-center text-gray-400 mt-10">
        Reconciliation coming soon.
      </p>
    )}
  </>
)}

    {/* Send Form Modal */}
    {showSendModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Send Form to {patientName}</h3>

          <label className="block text-sm font-medium mb-1">Delivery Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded mb-4 px-3 py-2">
            <option value="website">Website</option>
            <option value="sms">SMS</option>
            <option value="tablet">Tablet</option>
          </select>

          <label className="block text-sm font-medium mb-1">Select Form</label>
          <select value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)} className="w-full border rounded mb-4 px-3 py-2">
            <option value="">Select a form...</option>
            {availableForms.map((form) => (
              <option key={form.id} value={form.id}>{form.name}</option>
            ))}
          </select>

          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowSendModal(false)} className="text-gray-500 hover:underline">Cancel</button>
            <button onClick={handleSendForm} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
          </div>
        </div>
      </div>
    )}
  </div>;
};

export default FormsSidePanel;

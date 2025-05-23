import React, { useEffect, useState } from "react";
import axios from "axios";
import CreatePatientModal from "../Patients/CreatePatientModal";

export default function FormsTab() {
  const [linkedForms, setLinkedForms] = useState([]);
  const [unlinkedForms, setUnlinkedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [formPatientInfo, setFormPatientInfo] = useState(null);

useEffect(() => {
  const fetchForms = async () => {
    try {
      const token = localStorage.getItem("token");

      const [unlinkedRes, linkedRes] = await Promise.all([
        axios.get("/api/custom-form-submissions/unlinked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("/api/custom-form-submissions/linked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setUnlinkedForms(unlinkedRes.data);
      setLinkedForms(linkedRes.data);
    } catch (err) {
      console.error("❌ Error fetching form submissions", err);
    } finally {
      setLoading(false);
    }
  };

  fetchForms();
}, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="px-6 py-4">
      <h2 className="text-xl font-semibold mb-3">🆕 New Patient Forms</h2>
      {unlinkedForms.length === 0 ? (
        <p className="text-sm text-gray-500">No new patient forms found.</p>
      ) : (
        unlinkedForms.map((form) => (
          <div
            key={form.submission_id}
            className="bg-white p-4 rounded shadow border mb-3"
          >
            <div className="font-semibold">{form.form_name}</div>
            <div className="text-sm text-gray-500">
              Submitted: {new Date(form.submitted_at).toLocaleString()}
            </div>
  <div className="mt-3 flex gap-4">
  <button
    onClick={async () => {
      setSelectedSubmission(form);
      setLoadingDetails(true);
      try {
        const res = await axios.get(`/api/custom-form-submissions/${form.submission_id}`);
        setSubmissionDetails(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch submission details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }}
    className="text-sm text-blue-600 underline hover:text-blue-800"
  >
    View
  </button>

</div>


          </div>
        ))
      )}

      <h2 className="text-xl font-semibold mt-6 mb-3">👤 Returning Patient Forms</h2>
      {linkedForms.length === 0 ? (
        <p className="text-sm text-gray-500">No returning patient forms found.</p>
      ) : (
        linkedForms.map((form) => (
          <div
            key={form.submission_id}
            className="bg-white p-4 rounded shadow border mb-3"
          >
            <div className="font-semibold">{form.form_name}</div>
            <div className="text-sm text-gray-500">
              Submitted: {new Date(form.submitted_at).toLocaleString()}
            </div>
            <button className="mt-2 text-blue-600 underline text-sm">View</button>
          </div>
        ))
          )}
{selectedSubmission && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg relative max-h-[80vh] overflow-y-auto">
      <button
        onClick={() => {
          setSelectedSubmission(null);
          setSubmissionDetails(null);
        }}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-2">{selectedSubmission.form_name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Submitted at: {new Date(selectedSubmission.submitted_at).toLocaleString()}
      </p>

      {loadingDetails ? (
        <p>Loading...</p>
      ) : submissionDetails ? (
        <div className="space-y-3">
          {submissionDetails.answers.map((ans) => (
            <div key={ans.answer_id} className="p-2 border rounded">
              <div className="text-sm font-semibold text-gray-800">{ans.label}</div>
              {ans.field_type === "signature" && ans.value?.startsWith("data:image") ? (
  <img
    src={ans.value}
    alt="Signature"
    className="mt-1 border rounded"
    style={{ maxWidth: 300, maxHeight: 150 }}
  />
) : (
  <div className="text-sm text-gray-600 mt-1">{ans.value || "—"}</div>
)}
            </div>
          ))}

                 <button
      onClick={() => {
        const getValue = (label) => {
          const match = submissionDetails.answers.find((a) =>
            a.label.toLowerCase().includes(label.toLowerCase())
          );
          return match?.value || "";
        };

        setFormPatientInfo({
          firstName: getValue("first name"),
          lastName: getValue("last name"),
          phone: getValue("phone"),
          email: getValue("email"),
        });

        setShowCreateModal(true);
      }}
      className="mt-4 text-sm text-green-700 underline hover:text-green-900"
    >
      + Create Patient
    </button>
        </div>
      ) : (
        <p className="text-sm text-red-500">Failed to load form data.</p>
      )}
    </div>
  </div>
)}
{showCreateModal && (
  <CreatePatientModal
    onClose={() => setShowCreateModal(false)}
    prefill={formPatientInfo}
    onPatientCreated={async () => {
      setShowCreateModal(false);
      // 🌀 Optionally re-fetch forms to update linked/unlinked state
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [unlinkedRes, linkedRes] = await Promise.all([
          axios.get("/api/custom-form-submissions/unlinked", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/custom-form-submissions/linked", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUnlinkedForms(unlinkedRes.data);
        setLinkedForms(linkedRes.data);
      } catch (err) {
        console.error("❌ Error refreshing forms after patient creation:", err);
      } finally {
        setLoading(false);
      }
    }}
  />
)}


    </div> //closing div of the main return statement
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import CreatePatientModal from "../Patients/CreatePatientModal";
import { toast } from "react-toastify";

export default function FormsTab() {
  const [linkedForms, setLinkedForms] = useState([]);
  const [unlinkedForms, setUnlinkedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [formPatientInfo, setFormPatientInfo] = useState(null);
  const [loadingLinkedForms, setLoadingLinkedForms] = useState(true);

useEffect(() => {
  const fetchForms = async () => {
    try {
      setLoading(true);             // Overall loading state
      setLoadingLinkedForms(true);  // Specifically for returning patient forms

      const token = localStorage.getItem("token");

      const [unlinkedRes, linkedRes] = await Promise.all([
        axios.get("/api/custom-form-submissions/unlinked", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/form-admin/returning-forms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUnlinkedForms(unlinkedRes.data);
      setLinkedForms(linkedRes.data);
    } catch (err) {
      console.error("❌ Error fetching form submissions", err);
    } finally {
      setLoading(false);
      setLoadingLinkedForms(false);  // Make sure this is set even if error occurs
    }
  };

  fetchForms();
}, []);



const handleClear = async (form) => {
  const confirm = window.confirm("Are you sure you want to clear this uploaded form from view?");
  if (!confirm) return;

  try {
    await axios.put(
  `/api/custom-form-submissions/${form.submission_id}/clear-upload`,
      null,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast.success("✅ Upload cleared");

    // Refresh both form lists
    setLoading(true);
    const token = localStorage.getItem("token");
    const [unlinkedRes, linkedRes] = await Promise.all([
      axios.get("/api/custom-form-submissions/unlinked", {
        headers: { Authorization: `Bearer ${token}` },
      }),
       axios.get("/api/form-admin/returning-forms", {
    headers: { Authorization: `Bearer ${token}` },
  }),
]);
    setUnlinkedForms(unlinkedRes.data);
    setLinkedForms(linkedRes.data);
  } catch (err) {
    console.error("❌ Failed to clear upload:", err);
    toast.error("Failed to clear form from view.");
  } finally {
    setLoading(false);
  }
};








  if (loading) return <p>Loading...</p>;
const visibleLinkedForms = linkedForms.filter(f => !f.hidden_by_user);
  return (
    <div className="px-6 py-4">
      <h2 className="text-xl font-semibold mb-3">🆕 New Patient Forms</h2>
      <p className="text-sm text-gray-500 mb-4">
  These forms were submitted by patients who don’t yet have a record in Open Dental.
  Review and create a new patient to link the form and upload it to Imaging.
</p>
      {unlinkedForms.length === 0 ? (
        <p className="text-sm text-gray-500">No new patient forms found.</p>
      ) : (
        unlinkedForms.map((form) => (
          <div
            key={form.submission_id}
            className="bg-white p-4 rounded shadow border mb-3"
          >
            <div className="font-semibold">{form.form_name}</div>
            {form.patient_name && (
  <div className="text-sm text-gray-700">Patient Name: {form.patient_name}</div>
)}
            <div className="text-xs inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium mb-2">
  ⛔ Not Linked
</div>
            <div className="text-sm text-gray-500">
              Submitted: {new Date(form.submitted_at).toLocaleString()}
            </div>
            <div className="mt-3 flex gap-4">
              <button
                onClick={async () => {
                  setSelectedSubmission(form);
                  setLoadingDetails(true);
                  try {
                    const res = await axios.get(
                      `/api/custom-form-submissions/${form.submission_id}`
                    );
                    setSubmissionDetails(res.data);
                  } catch (err) {
                    console.error("❌ Failed to fetch submission details:", err);
                  } finally {
                    setLoadingDetails(false);
                  }
                }}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                🔍 View Details
              </button>
            </div>
            <button
  className="text-sm text-red-600 underline hover:text-red-800"
  onClick={async () => {
    const confirm = window.confirm("Permanently delete this form?");
    if (!confirm) return;
    try {
      await axios.delete(`/api/custom-form-submissions/${form.submission_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("🗑 Form deleted.");
      const token = localStorage.getItem("token");
      const [unlinkedRes, linkedRes] = await Promise.all([
        axios.get("/api/custom-form-submissions/unlinked", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/form-admin/returning-forms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUnlinkedForms(unlinkedRes.data);
      setLinkedForms(linkedRes.data);
    } catch (err) {
      console.error("❌ Error deleting form:", err);
      toast.error("Failed to delete form.");
    }
  }}
>
  🗑 Delete
            </button>
{!form.patient_id && (
<button
  onClick={() => {
    setSelectedSubmission(form);
    setFormPatientInfo(null);
    setIsLinkMode(true); // <—
    setShowCreateModal(true);
  }}
  className="text-sm text-indigo-600 underline hover:text-indigo-800 mt-1"
>
  🔗 Link to Patient
</button>
)}
          </div>
        ))
      )}

      <h2 className="text-xl font-semibold mt-6 mb-3">👤 Returning Patient Forms</h2>
      <p className="text-sm text-gray-500 mb-4">
  These forms are already linked to an existing Open Dental patient. You can review and upload them to Imaging if needed.
</p>
{loadingLinkedForms ? (
  <p className="text-sm text-gray-500">Loading returning patient forms...</p>
) : visibleLinkedForms.length === 0 ? (
  <p className="text-sm text-gray-500">No returning patient forms found.</p>
) : (
  visibleLinkedForms.map((form) => (
    <div
      key={form.submission_id}
      className="bg-white p-4 rounded shadow border mb-3"
    >
      <div className="font-semibold">
        {form.form_name || `Form ID: ${form.form_id}`}
      </div>

      {form.uploaded_at && (
        <div className="text-xs inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium mb-2">
          ✅ Uploaded
        </div>
      )}

      <div className="text-xs inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium mb-2">
        ✅ Linked
      </div>

      <div className="text-sm text-gray-700">
        Patient Name: {form.patientName || "Unknown"}
      </div>
      <div className="text-sm text-gray-500">
        DOB: {form.birthdate ? new Date(form.birthdate).toLocaleDateString() : "—"}
      </div>
      <div className="text-sm text-gray-500">
        Submitted: {new Date(form.submitted_at).toLocaleString()}
      </div>

      <button
  className="text-sm text-red-600 underline hover:text-red-800 mt-2"
  onClick={async () => {
    const confirm = window.confirm("Permanently delete this form?");
    if (!confirm) return;
    try {
      await axios.delete(`/api/custom-form-submissions/${form.submission_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("🗑 Form deleted.");
      const token = localStorage.getItem("token");
      const [unlinkedRes, linkedRes] = await Promise.all([
        axios.get("/api/custom-form-submissions/unlinked", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/form-admin/returning-forms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUnlinkedForms(unlinkedRes.data);
      setLinkedForms(linkedRes.data);
    } catch (err) {
      console.error("❌ Error deleting form:", err);
      toast.error("Failed to delete form.");
    }
  }}
>
  🗑 Delete
</button>

      <button
        className="text-sm text-blue-600 underline hover:text-blue-800 mt-2"
        onClick={async () => {
          setSelectedSubmission(form);
          setLoadingDetails(true);
          try {
            const res = await axios.get(
  `/api/custom-form-submissions/${form.submission_id}`
);
            setSubmissionDetails(res.data);
          } catch (err) {
            console.error("❌ Failed to fetch submission details:", err);
          } finally {
            setLoadingDetails(false);
          }
        }}
      >
        🔍 View Details
      </button>

      {!form.uploaded_at && (
        <button
          className="text-sm text-green-600 underline hover:text-green-800 ml-4"
          onClick={async () => {
            try {
              await axios.post(
  `/api/custom-form-submissions/${form.submission_id}/upload`,
                null,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              toast.success("📤 Form uploaded to Open Dental Imaging.");
            } catch (err) {
              console.error("❌ Upload failed:", err);
              toast.error("Upload failed. Please try again.");
            }
          }}
        >
          📤 Upload to Imaging
        </button>
      )}

      {form.uploaded_at && (
        <button
          className="text-sm text-red-600 underline hover:text-red-800 ml-4"
          onClick={() => handleClear(form)}
        >
          ❌ Clear Upload
        </button>
      )}
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
              Submitted at:{" "}
              {new Date(selectedSubmission.submitted_at).toLocaleString()}
            </p>

            {loadingDetails ? (
              <p>Loading...</p>
            ) : submissionDetails ? (
              <div className="space-y-3">
                {submissionDetails.answers.map((ans) => (
                  <div key={ans.answer_id} className="p-2 border rounded">
                    <div className="text-sm font-semibold text-gray-800">{ans.label}</div>
                    {ans.field_type === "signature" &&
                    ans.value?.startsWith("data:image") ? (
                      <img
                        src={ans.value}
                        alt="Signature"
                        className="mt-1 border rounded"
                        style={{ maxWidth: 300, maxHeight: 150 }}
                      />
                    ) : (
                      <div className="text-sm text-gray-600 mt-1">
                        {ans.value || "—"}
                      </div>
                    )}
                  </div>
                ))}

              {!selectedSubmission?.patient_id && (
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

      setIsLinkMode(false);
      setShowCreateModal(true);
    }}
    className="mt-4 text-sm text-green-700 underline hover:text-green-900"
  >
    ➕ Create Patient
  </button>
)}
              </div>
            ) : (
              <p className="text-sm text-red-500">Failed to load form data.</p>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreatePatientModal
          isLinkMode={isLinkMode}
          onClose={() => setShowCreateModal(false)}
          prefill={formPatientInfo}
          onPatientCreated={async (newPatient) => {
            setShowCreateModal(false);

            try {
              // 🔗 Link form to patient
              await axios.put(
                `/api/custom-form-submissions/${selectedSubmission.submission_id}/link`,
                { patNum: newPatient.PatNum },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              // 📤 Upload PDF to Open Dental Imaging
              await axios.post(
                `/api/custom-form-submissions/${selectedSubmission.submission_id}/upload`,
                null,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              toast.success("Form uploaded to Open Dental.");

              // 🔄 Refresh form lists
              setLoading(true);
              const token = localStorage.getItem("token");
              const [unlinkedRes, linkedRes] = await Promise.all([
                axios.get("/api/custom-form-submissions/unlinked", {
                  headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("/api/form-admin/returning-forms", {
                  headers: { Authorization: `Bearer ${token}` },
                }),
              ]);
              setUnlinkedForms(unlinkedRes.data);
              setLinkedForms(linkedRes.data);
            } catch (err) {
              console.error("❌ Error during form upload or linking:", err);
              alert("Something went wrong while uploading the form to Open Dental.");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}

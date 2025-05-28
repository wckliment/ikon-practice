import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SignaturePad from "react-signature-canvas";
import { toast } from "react-toastify";

export default function FillCustomForm() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [groupedSections, setGroupedSections] = useState([]);
  const signaturePads = useRef({});
  const [searchParams] = useSearchParams();
  const isTablet = searchParams.get("tablet") === "true";
  const locationCode = searchParams.get("locationCode");
  const navigate = useNavigate();

useEffect(() => {
  const fetchFormByToken = async () => {
    try {
      const res = await axios.get(`/api/custom-form-tokens/${token}`);
      console.log("📦 Token Load Response:", res.data); // 👈 Debug line

      const { form, fields, patient, method } = res.data;
      setForm({ ...form, fields, method }); // ✅ Preserve method for use later
      setPatient(patient);

      const bySection = {};
      fields.forEach((field) => {
        const title = field.section_title || "General";
        if (!bySection[title]) bySection[title] = [];
        bySection[title].push(field);
      });

      const grouped = Object.entries(bySection).map(([sectionTitle, fields]) => ({
        sectionTitle,
        fields,
      }));

      setGroupedSections(grouped);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load form by token:", err);
      setLoading(false);
    }
  };

  fetchFormByToken();
}, [token]);


  const handleInputChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

const handleSubmit = async () => {
  try {
    // ✅ Put this at the start of the function
    const isPublic = form?.method === "website";
    console.log("🌐 isPublic form submission?", isPublic, "| method:", form?.method);


    // 1. Extract signature data
    const signatureData = {};
    Object.keys(signaturePads.current).forEach((fieldId) => {
      const pad = signaturePads.current[fieldId];
      if (pad && !pad.isEmpty()) {
        signatureData[fieldId] = pad.getTrimmedCanvas().toDataURL("image/png");
      }
    });

    // 2. Combine answers
    const combinedAnswers = {
      ...answers,
      ...signatureData,
    };

    // 3. Build payload
    const answerArray = Object.entries(combinedAnswers)
      .filter(([fieldId]) => {
        const f = form.fields.find((f) => f.id === parseInt(fieldId));
        return f?.field_type !== "static_text";
      })
      .map(([fieldId, value]) => {
        const field = form.fields.find((f) => f.id === parseInt(fieldId));
        return {
          field_id: parseInt(fieldId),
          value: Array.isArray(value) &&
            (field?.field_type === "checkbox" || field?.field_type === "radio")
            ? value.join(", ")
            : value,
        };
      });

    const payload = {
      patient_id: patient?.id || null,
      submitted_by_ip: "192.168.1.55",
      answers: answerArray,
    };

// 4. Decide which endpoint to hit
const submissionUrl = isPublic
  ? `/api/form-submissions/public` // ✅ matches updated backend route
  : `/api/forms/${form.id}/submissions`;

// ✅ Get correct token before sending the request
const token = isTablet
  ? localStorage.getItem("tabletToken")
  : localStorage.getItem("token");

// ✅ Send the submission request with or without auth
const res = await axios.post(submissionUrl, payload, {
  headers: isPublic ? {} : { Authorization: `Bearer ${token}` },
  skipRefresh: isTablet, // ✅ This prevents redirect during tablet usage
});

const submissionId = res.data.submission_id;

 // 5. Upload PDF if internal
if (!isPublic) {
  const uploadToken = isTablet
    ? localStorage.getItem("tabletToken")
    : localStorage.getItem("token");

  await axios.post(
    `/api/forms/${form.id}/submissions/${submissionId}/upload`,
    {},
    {
      headers: {
        Authorization: `Bearer ${uploadToken || ""}`,
      },
    }
  );
}

    // 6. Confirmation
if (!isTablet) {
  toast.success(`✅ Form submitted${isPublic ? "" : " and uploaded to Open Dental!"}`);
}


   if (isTablet) {
  localStorage.setItem("formCompleted", "true");
}


if (isTablet && locationCode) {
  navigate(`/tablet-checkin/${locationCode}?step=4`);
  return;
}

    // ✅ Cross-tab sync to ikonConnect
try {
  if (window.opener && form?.name) {
    const key = `formCompleted_${form.name}`;
    window.opener.postMessage({ type: "formCompleted", key }, "*");
    console.log("📤 Sent completion message to opener:", key);
  }
} catch (err) {
  console.warn("⚠️ Could not send postMessage to opener:", err);
}

    // window.location.href = "/forms/thank-you";

  } catch (err) {
  console.error("❌ Submission failed:", err.message, err);
  alert("Failed to submit form. Please try again.");
}
};

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!form) return <div className="p-6 text-red-500">Form not found or expired.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{form.name}</h1>
      {patient && (
        <p className="mb-4 text-gray-600">
          Linked to: {patient.FName} {patient.LName}
        </p>
      )}

      <form className="space-y-6">
        {groupedSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            <h3 className="text-lg font-bold text-blue-700 mb-2">
              {section.sectionTitle}
            </h3>

            {section.fields.map((field) => (
              <div key={field.id} className="mb-4">
                {field.field_type === "static_text" ? (
                  <div className="bg-gray-100 text-gray-700 p-3 rounded italic whitespace-pre-line">
                    {field.label}
                  </div>
                ) : (
                  <>
                   <label className="block font-semibold mb-1">
 {field.label}
  {field.is_required === 1 && (
    <span className="text-red-500 ml-1">*</span>
  )}
</label>



                    {field.field_type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      />
                    )}

                    {field.field_type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      />
                    )}

                    {field.field_type === "radio" && Array.isArray(field.options) && (
                      <div className="space-x-4">
                        {field.options.map((opt) => (
                          <label key={opt} className="inline-flex items-center">
                            <input
                              type="radio"
                              name={`field-${field.id}`}
                              value={opt}
                              checked={answers[field.id] === opt}
                              onChange={() => handleInputChange(field.id, opt)}
                              className="mr-1"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}

                   {field.field_type === "checkbox" && Array.isArray(field.options) && (
  <div className="flex flex-col gap-1">
    {field.options.map((opt) => (
      <label key={opt} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={answers[field.id]?.includes(opt) || false}
          onChange={(e) => {
            const prev = answers[field.id] || [];
            const next = e.target.checked
              ? [...prev, opt]
              : prev.filter((o) => o !== opt);
            handleInputChange(field.id, next);
          }}
        />
        <span>{opt}</span>
      </label>
    ))}
  </div>
)}

                    {field.field_type === "date" && (
                      <input
                        type="date"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      />
                    )}

                    {field.field_type === "signature" && (
                      <div>
                        <SignaturePad
                          ref={(ref) => (signaturePads.current[field.id] = ref)}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: "border border-gray-300 rounded bg-white",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => signaturePads.current[field.id]?.clear()}
                          className="mt-2 px-3 py-1 bg-gray-200 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

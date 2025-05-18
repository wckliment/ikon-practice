import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FillCustomForm() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [groupedSections, setGroupedSections] = useState([]);

  useEffect(() => {
    const fetchFormByToken = async () => {
      try {
        const res = await axios.get(`/api/custom-form-tokens/${token}`);
        const { form, fields, patient } = res.data;
        setForm({ ...form, fields });
        setPatient(patient);

        // Group fields by section_title
        const bySection = {};
        fields.forEach((field) => {
          const title = field.section_title || "General";
          if (!bySection[title]) bySection[title] = [];
          bySection[title].push(field);
        });

        const grouped = Object.entries(bySection).map(
          ([sectionTitle, fields]) => ({
            sectionTitle,
            fields,
          })
        );
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
      const payload = {
        patient_id: patient?.id || null,
        submitted_by_ip: "192.168.1.55", // Replace if you want to collect real IP
        answers: Object.entries(answers)
          .filter(([fieldId]) => {
            const f = form.fields.find((f) => f.id === parseInt(fieldId));
            return f?.field_type !== "static_text";
          })
          .map(([fieldId, value]) => ({
            field_id: parseInt(fieldId),
            value,
          })),
      };

      await axios.post(`/api/forms/${form.id}/submissions`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      alert("✅ Form submitted!");
    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert("Failed to submit form.");
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!form) return <div className="p-6 text-red-500">Form not found or expired.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{form.name}</h1>
      {patient && (
        <p className="mb-4 text-gray-600">
          Linked to: {patient.first_name} {patient.last_name}
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
                      {Boolean(field.is_required) && (
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

                    {field.field_type === "checkbox" && (
                      <input
                        type="checkbox"
                        checked={answers[field.id] || false}
                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                        className="mr-2"
                      />
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
                      <div className="border border-dashed py-4 px-2 text-center text-gray-500">
                        🖋️ Signature Pad Placeholder (integrate react-signature-canvas)
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


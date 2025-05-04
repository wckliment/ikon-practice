import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import staticContentMap from '../data/formStaticContent';
import { formTemplates } from '../data/formTemplates';
import fieldDisplayMap from '../data/fieldDisplayMap';
export default function PublicForm() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`/api/public-forms/fill/${token}`);
        console.log("📦 Form response:", res.data);

        const sheetDef = res.data.form.sheetDef;
        const template = formTemplates[sheetDef.Description] || [];

        setForm({
          ...res.data.form,
          sheetFieldsTemplate: template
        });
        setPatient(res.data.patient);

        // Set default field values
        const initial = {};
        template.forEach((field, idx) => {
          initial[idx] = field.FieldValue || '';
        });
        setFieldValues(initial);
      } catch (err) {
        console.error('❌ Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [token]);

  const handleChange = (idx, value) => {
    setFieldValues((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
     const reservedFieldNames = [
  'dateTime.Today',
  'patientName.FName',
  'patientName.LName',
  'birthdate',
  'sheet.Description'
];

const updatedFields = form.sheetFieldsTemplate
  .map((field, idx) => ({
    FieldName: field.FieldName,
    FieldType: field.FieldType,
    FieldValue: fieldValues[idx] || '',
    IsRequired: field.IsRequired
  }))
  .filter(field => !reservedFieldNames.includes(field.FieldName));

     await axios.post(`/api/public-forms/submit/${token}`, {
  fieldResponses: updatedFields
});

      setSubmitted(true);
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("There was an error submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!form || !patient) return <div>Error loading form</div>;
  if (submitted) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-semibold">✅ Thank you!</h2>
        <p className="text-sm mt-2">Your form has been submitted.</p>
      </div>
    );
  }

  const staticText = staticContentMap[form.sheetDef.Description];
  const getDisplayLabel = (rawFieldName) => {
  return fieldDisplayMap[rawFieldName] || rawFieldName;
};


  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-1">{form.sheetDef.Description}</h1>
      <p className="text-sm mb-4">
        For {patient.firstName} {patient.lastName} (DOB: {patient.birthdate})
      </p>

      <form className="mb-6" onSubmit={handleSubmit}>
        {form.sheetFieldsTemplate?.map((field, idx) => {
          if (field.FieldType === 'InputField') {
            return (
              <div key={idx} className="mb-4">
               <label className="block text-sm font-medium mb-1">
  {getDisplayLabel(field.FieldName)}
</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={fieldValues[idx] || ''}
                  onChange={(e) => handleChange(idx, e.target.value)}
                />
              </div>
            );
          }

          if (field.FieldType === 'SigBox') {
            return (
              <div key={idx} className="mb-4">
                <label className="block text-sm font-medium mb-1">Signature</label>
                <div className="border p-4 rounded bg-gray-100 text-gray-500">
                  [Signature Box Placeholder]
                </div>
              </div>
            );
          }

          return null;
        })}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {staticText && (
        <div className="text-sm text-gray-800 space-y-4 whitespace-pre-line">
          {staticText.split('\n').map((para, idx) => (
            <p key={idx}>{para.trim()}</p>
          ))}
        </div>
      )}
    </div>
  );
}

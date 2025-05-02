import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import staticContentMap from '../data/formStaticContent';

export default function PublicForm() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`/api/public-forms/fill/${token}`);
        console.log("📦 Form response:", res.data);
        setForm(res.data.form);
        setPatient(res.data.patient);
      } catch (err) {
        console.error('❌ Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [token]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!form || !patient) return <div>Error loading form</div>;

  const staticText = staticContentMap[form.sheetDef.Description];

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-1">{form.sheetDef.Description}</h1>
      <p className="text-sm mb-4">
        For {patient.firstName} {patient.lastName} (DOB: {patient.birthdate})
      </p>

      {/* 👉 1. Render dynamic form fields (from Open Dental) */}
      <form className="mb-6">
        {form.sheetFields?.map((field) => {
          if (field.FieldType === 'InputField') {
            return (
              <div key={field.SheetFieldNum} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {field.FieldName}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  defaultValue={field.FieldValue}
                />
              </div>
            );
          }

          if (field.FieldType === 'SigBox') {
            return (
              <div key={field.SheetFieldNum} className="mb-4">
                <label className="block text-sm font-medium mb-1">Signature</label>
                <div className="border p-4 rounded bg-gray-100 text-gray-500">
                  [Signature Box Placeholder]
                </div>
              </div>
            );
          }

          return null; // Ignore StaticText and OutputText for now
        })}
      </form>

      {/* 👉 2. Render static content (hardcoded text) */}
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

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SignaturePad from 'react-signature-canvas';

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
  const sigPadRef = useRef(null); // <-- Signature pad ref

 useEffect(() => {
  const fetchForm = async () => {
    try {
      const res = await axios.get(`/api/public-forms/fill/${token}`);
      console.log("📦 Form response:", res.data);

      const sheetDef = res.data.form.sheetDef;
      const templateEntry = formTemplates[sheetDef.Description];

      const fields = Array.isArray(templateEntry?.fields) ? templateEntry.fields : [];
      const openDentalOnly = !!templateEntry?.openDentalOnly;

      setForm({
        ...res.data.form,
        sheetFieldsTemplate: fields,
        openDentalOnly
      });

      setPatient(res.data.patient);

     const initial = {};
fields.forEach((field, idx) => {
  const name = field.FieldName;

  if (name === 'patient.nameFL') {
    initial[idx] = `${res.data.patient.firstName} ${res.data.patient.lastName}`;
  } else if (name === 'patient.address') {
    initial[idx] = res.data.patient.Address || '';
  } else if (name === 'patient.cityStateZip') {
    const { City, State, Zip } = res.data.patient;
    initial[idx] = [City, State, Zip].filter(Boolean).join(', ');
  } else if (name === 'patient.priProvNameFL') {
    initial[idx] = res.data.patient.ProviderName || '';
  } else {
    initial[idx] = field.FieldValue || '';
  }
});
      setFieldValues(initial);
      console.log("🧪 Initial field values:", initial);
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

      // ✅ Debug raw values before transformation
  console.log("📝 Raw fieldValues:", fieldValues);

    // Step 1: Filter out template SigBoxes (which have empty FieldValue and are static)
    const updatedFields = form.sheetFieldsTemplate
      .map((field, idx) => ({
        FieldName: field.FieldName || '', // fallback to empty string
        FieldType: field.FieldType,
        FieldValue: fieldValues[idx] || '',
        IsRequired: field.IsRequired
      }))
      .filter(field =>
        !reservedFieldNames.includes(field.FieldName) &&
        !(field.FieldType === 'SigBox') // remove placeholder SigBoxes
      );

    // Step 2: Add actual signature as a new SigBox field (if drawn)
    console.log("🖊️ SigPad isEmpty?", sigPadRef.current?.isEmpty());
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const sigImage = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      updatedFields.push({
        FieldType: 'SigBox',
        FieldName: '', // FieldName must be empty for Open Dental SigBox
        FieldValue: sigImage,
        IsRequired: true
      });
    }

    // Debug: Log what's actually being submitted
    console.log("📤 Submitting fields:", updatedFields);
    console.log("🦷 ToothNum field:", updatedFields.find(f => f.FieldName === 'toothNum'));
    console.log("🖊️ Signature field:", updatedFields.find(f => f.FieldType === 'SigBox'));


    // Step 3: Submit to backend
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

  if (form.openDentalOnly) {
  return (
    <div className="text-center mt-8">
      <h2 className="text-xl font-semibold">📄 In-Office Form Only</h2>
      <p className="text-sm mt-2">
        This form must be completed directly inside Open Dental. Online submission is not supported for this form type.
      </p>
    </div>
  );
}


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
                <SignaturePad
                  ref={sigPadRef}
                  canvasProps={{
                    className: "border border-gray-300 rounded w-full h-32"
                  }}
                />
                <button
                  type="button"
                  className="text-sm text-blue-600 mt-1"
                  onClick={() => sigPadRef.current.clear()}
                >
                  Clear Signature
                </button>
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

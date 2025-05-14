import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SignaturePad from 'react-signature-canvas';
import staticContentMap from '../data/formStaticContent';
import { formTemplates } from '../data/formTemplates';
import fieldDisplayMap from '../data/fieldDisplayMap';
import MedicalHistoryForm from '../forms/MedicalHistoryForm';
import StaticContentRenderer from '../components/StaticContentRenderer';
import ConsentForm from '../components/ConsentForm';

export default function PublicForm() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sigPadRef = useRef(null);

useEffect(() => {
  const fetchForm = async () => {
    try {
      const res = await axios.get(`/api/public-forms/fill/${token}`);
      const sheetDef = res.data.form.sheetDef;
      const description = sheetDef.Description || '';
      const normalizedKey = description.replace(/\s+/g, ' ').trim().toLowerCase();

      const matchedTemplate = Object.entries(formTemplates).find(
        ([key]) => key.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedKey
      )?.[1];

      if (!matchedTemplate || !Array.isArray(matchedTemplate.fields)) {
        console.warn(`⚠️ No matching form template for: "${description}"`);
        setForm(null);
        return;
      }

      setForm({
        ...res.data.form,
        sheetFieldsTemplate: matchedTemplate,
        openDentalOnly: !!matchedTemplate.openDentalOnly
      });

      console.log("✅ sheetFieldsTemplate from backend:", res.data.form.sheetFieldsTemplate);


      setPatient(res.data.patient);

      const initial = {};
      matchedTemplate.fields.forEach((field) => {
        const name = field.FieldName;
        const pat = res.data.patient;

        if (name === 'patient.nameFL') {
          initial[name] = `${pat.firstName} ${pat.lastName}`;
        } else if (name === 'patient.address') {
          initial[name] = pat.Address || '';
        } else if (name === 'patient.cityStateZip') {
          initial[name] = [pat.City, pat.State, pat.Zip].filter(Boolean).join(', ');
        } else if (name === 'patient.priProvNameFL') {
          initial[name] = pat.ProviderName || '';
        } else {
          initial[name] = field.FieldValue || '';
        }
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

const handleChange = (fieldOrEvent, maybeValue) => {
  if (typeof fieldOrEvent === 'object' && fieldOrEvent.target) {
    // Called like: handleChange({ target: { name, value } })
    const { name, value } = fieldOrEvent.target;
    setFieldValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  } else {
    // Called like: handleChange("FieldName", value)
    setFieldValues((prev) => ({
      ...prev,
      [fieldOrEvent]: maybeValue,
    }));
  }
};

const handleSubmit = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  setSubmitting(true);

  try {
    const updatedFields = [];

    for (const [key, value] of Object.entries(fieldValues)) {
      if (key === 'signature') continue;

      updatedFields.push({
        FieldName: key,
        FieldType: 'InputField',
        FieldValue: value,
        IsRequired: false
      });
    }

if (fieldValues.signature) {
  updatedFields.push({
    FieldName: "signature",
    FieldType: "SigBox",
    FieldValue: fieldValues.signature,
    IsRequired: true
  });
}
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
  if (!Array.isArray(form?.sheetFieldsTemplate?.fields) || form.sheetFieldsTemplate.fields.length === 0) {
  return (
    <div className="text-center mt-8">
      ⚠️ This form is currently unavailable. Please contact the office.
    </div>
  );
}

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

  // ✅ Custom medical history layout
  if (form.sheetDef.Description === "Medical History") {
    return (
      <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
        <h1 className="text-xl font-bold mb-1">{form.sheetDef.Description}</h1>
        <p className="text-sm mb-4">
          For {patient.firstName} {patient.lastName} (DOB: {patient.birthdate})
        </p>
        <MedicalHistoryForm
          fieldValues={fieldValues}
          handleChange={handleChange}
          sigPadRef={sigPadRef}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }

 // ✅ ConsentForm layout if customComponent is "ConsentForm"

// Clean the description to avoid trailing/leading space issues
const cleanDescription = form.sheetDef.Description || "";
const normalizedKey = cleanDescription.replace(/\s+/g, ' ').trim().toLowerCase();

const formTemplate = Object.entries(formTemplates).find(
  ([key]) => key.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedKey
)?.[1];

const staticTextKey = Object.keys(staticContentMap).find(
  key => key.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedKey
);
  const staticText = staticTextKey ? staticContentMap[staticTextKey] : null;
// ✅ Add debug logs here
console.log("🧪 formName:", cleanDescription);
console.log("🧪 normalizedKey:", normalizedKey);
console.log("🧪 matched staticTextKey:", staticTextKey);
console.log("🧪 Static Text Found?", !!staticText);


const getDisplayLabel = (rawFieldName) => fieldDisplayMap[rawFieldName] || rawFieldName;

console.log("🧪 Loaded formTemplate:", formTemplate);
console.log("🧪 Using customComponent:", formTemplate?.customComponent);
console.log("🧪 ConsentForm fields:", formTemplate?.fields);




  if (formTemplate?.customComponent === "ConsentForm") {
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-1">{form.sheetDef.Description}</h1>
      <p className="text-sm mb-4">
        For {patient.firstName} {patient.lastName} (DOB: {patient.birthdate})
      </p>

     <ConsentForm
  fieldValues={fieldValues}
  handleChange={handleChange}
  staticText={staticText}
  fieldLabels={fieldDisplayMap}
  fields={formTemplate.fields}
/>
      <form className="mt-6" onSubmit={handleSubmit}>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}



  // ✅ Generic fallback form rendering




  console.log("🧪 Form Name:", form.sheetDef.Description);
console.log("🧪 Static Content:", staticContentMap[form.sheetDef.Description]);
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-1">{form.sheetDef.Description}</h1>
      <p className="text-sm mb-4">
        For {patient.firstName} {patient.lastName} (DOB: {patient.birthdate})
      </p>

      <form className="mb-6" onSubmit={handleSubmit}>
  {form.sheetDef.Description.startsWith("Dental Insurance Secural") && (
    <StaticContentRenderer formName={form.sheetDef.Description} />
  )}
        {form.sheetFieldsTemplate.fields.map((field) => {
          const label = getDisplayLabel(field.FieldName);
          const value = fieldValues[field.FieldName] || '';

          if (field.FieldType === 'InputField') {
         return (
    <div key={field.FieldName} className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>

      {label === "Other Authorized Party" && (
        <p className="text-xs text-gray-600 mb-1">
          Please list any other parties who can have access to your health information. Indicate the person's name and relationship to the patient. If you do not want anyone to access your health information write n/a.
        </p>
      )}

      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2"
        value={value}
        onChange={(e) => handleChange(field.FieldName, e.target.value)}
      />
    </div>
  );
}

          if (field.FieldType === 'RadioButton') {
            const options = field.options || ['Yes', 'No'];
            return (
              <div key={field.FieldName} className="mb-4">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <div className="flex gap-4 flex-wrap">
                  {options.map((option) => (
                    <label key={option} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`radio-${field.FieldName}`}
                        value={option}
                        checked={value === option}
                        onChange={() => handleChange(field.FieldName, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (field.FieldType === 'Select') {
            return (
              <div key={field.FieldName} className="mb-4">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={value}
                  onChange={(e) => handleChange(field.FieldName, e.target.value)}
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}

{form.sheetFieldsTemplate.fields.some(field => field.FieldType === 'SigBox') && (
  <div className="mb-4 mt-6">
    <label className="block text-sm font-medium mb-1">Signature</label>
    <SignaturePad
      ref={sigPadRef}
      canvasProps={{
        className: "border border-gray-300 rounded w-full h-32"
      }}
      onEnd={() => {
        const sigData = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
        setFieldValues((prev) => ({
          ...prev,
          signature: sigData
        }));
      }}
    />
    <button
      type="button"
      className="text-sm text-blue-600 mt-1"
      onClick={() => {
        sigPadRef.current.clear();
        setFieldValues((prev) => ({ ...prev, signature: '' }));
      }}
    >
      Clear Signature
    </button>
  </div>
)}


        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

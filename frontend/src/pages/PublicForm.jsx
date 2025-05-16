import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignaturePad from 'react-signature-canvas';
import staticContentMap from '../data/formStaticContent';
import { formTemplates } from '../data/formTemplates';
import fieldDisplayMap from '../data/fieldDisplayMap';
import MedicalHistoryForm from '../forms/MedicalHistoryForm';
import StaticContentRenderer from '../components/StaticContentRenderer';
import ConsentForm from '../components/ConsentForm';

export default function PublicForm({ isTablet = false }) {
  const { token, locationCode } = useParams();
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sigPadRef = useRef(null);
  const navigate = useNavigate();

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
          openDentalOnly: !!matchedTemplate.openDentalOnly,
        });

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

  useEffect(() => {
    if (!submitted || !isTablet || !locationCode) return;

    const timeout = setTimeout(() => {
      navigate(`/tablet-checkin/${locationCode}/forms`);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [submitted, isTablet, locationCode, navigate]);

  const handleChange = (fieldOrEvent, maybeValue) => {
    if (typeof fieldOrEvent === 'object' && fieldOrEvent.target) {
      const { name, value } = fieldOrEvent.target;
      setFieldValues((prev) => ({ ...prev, [name]: value }));
    } else {
      setFieldValues((prev) => ({ ...prev, [fieldOrEvent]: maybeValue }));
    }
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSubmitting(true);

    try {
      const updatedFields = Object.entries(fieldValues).flatMap(([key, value]) =>
        key === 'signature'
          ? []
          : [{
              FieldName: key,
              FieldType: 'InputField',
              FieldValue: value,
              IsRequired: false
            }]
      );

      if (fieldValues.signature) {
        updatedFields.push({
          FieldName: 'signature',
          FieldType: 'SigBox',
          FieldValue: fieldValues.signature,
          IsRequired: true,
        });
      }

      const formName = form?.sheetDef?.Description?.trim();
      await axios.post(`/api/public-forms/submit/${token}`, {
        fieldResponses: updatedFields,
      });

      if (formName) {
        localStorage.setItem(`formCompleted_${formName}`, 'true');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('❌ Error submitting form:', err);
      alert('There was an error submitting the form.');
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
        <p className="text-sm mt-2">
          {isTablet
            ? 'Redirecting back to your forms...'
            : 'Your form has been submitted.'}
        </p>
      </div>
    );
  }

  const cleanDescription = form.sheetDef.Description || '';
  const normalizedKey = cleanDescription.replace(/\s+/g, ' ').trim().toLowerCase();
  const formTemplate = Object.entries(formTemplates).find(
    ([key]) => key.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedKey
  )?.[1];
  const staticTextKey = Object.keys(staticContentMap).find(
    key => key.replace(/\s+/g, ' ').trim().toLowerCase() === normalizedKey
  );
  const staticText = staticTextKey ? staticContentMap[staticTextKey] : null;
  const getDisplayLabel = (rawFieldName) => fieldDisplayMap[rawFieldName] || rawFieldName;

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

        {form.sheetFieldsTemplate.fields.some(f => f.FieldType === 'SigBox') && (
          <div className="mb-4 mt-6">
            <label className="block text-sm font-medium mb-1">Signature</label>
            <SignaturePad
              ref={sigPadRef}
              canvasProps={{
                className: "border border-gray-300 rounded w-full h-32"
              }}
              onEnd={() => {
                const sigData = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
                setFieldValues((prev) => ({ ...prev, signature: sigData }));
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

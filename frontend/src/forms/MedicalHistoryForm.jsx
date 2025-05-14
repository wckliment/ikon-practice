import React from 'react';
import SignaturePad from 'react-signature-canvas';
import fieldDisplayMap from '../data/fieldDisplayMap';
import medicalHistoryLayout from '../data/medicalHistoryLayout';

export default function MedicalHistoryForm({
  fieldValues,
  handleChange,
  sigPadRef,
  submitting,
  handleSubmit
}) {
  const renderRadioGroup = (fieldName) => (
    <div key={fieldName} className="mb-4">
      <label className="block font-medium mb-1">
        {fieldDisplayMap[fieldName] || fieldName}
      </label>
      <div className="flex gap-4">
        <label>
          <input
            type="radio"
            name={fieldName}
            value="Yes"
            checked={fieldValues[fieldName] === 'Yes'}
            onChange={() => handleChange(fieldName, 'Yes')}
          />{' '}
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={fieldName}
            value="No"
            checked={fieldValues[fieldName] === 'No'}
            onChange={() => handleChange(fieldName, 'No')}
          />{' '}
          No
        </label>
      </div>
    </div>
  );

  const renderMedicationField = (fieldName) => (
    <div key={fieldName} className="flex items-center gap-2 mb-2">
      <input
        type="checkbox"
        name={`${fieldName}_discontinued`}
        checked={fieldValues[`${fieldName}_discontinued`] === true}
        onChange={(e) =>
          handleChange(`${fieldName}_discontinued`, e.target.checked)
        }
      />
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2"
        value={fieldValues[fieldName] || ''}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        placeholder={fieldDisplayMap[fieldName] || fieldName}
      />
    </div>
  );



  return (
   <form onSubmit={handleSubmit}>
      {medicalHistoryLayout.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{section.title}</h2>

          {section.staticText && (
            <p className="text-sm text-gray-700 mb-1 italic">
              {section.staticText}
            </p>
          )}

          {section.subtitle && (
            <p className="text-sm text-gray-500 mb-2 italic">
              {section.subtitle}
            </p>
          )}

          <div className={section.columns === 2 ? 'grid grid-cols-2 gap-4' : ''}>
            {section.fields.map((field) => {
              const name = field.name;
              const label = fieldDisplayMap[name] || name;

              if (field.type === 'radio') {
                return renderRadioGroup(name);
              }

              if (field.type === 'medication') {
                return renderMedicationField(name);
              }

              return (
                <div key={name} className="mb-4">
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={fieldValues[name] || ''}
                    onChange={(e) => handleChange(name, e.target.value)}
                    placeholder={label}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

  {/* Signature Field */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Signature</label>
  <SignaturePad
    ref={sigPadRef}
    canvasProps={{
      className: 'w-full h-32 border border-gray-300 rounded',
    }}
    onEnd={() => {
      const sigData = sigPadRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png');
      handleChange('signature', sigData);
    }}
  />
  <button
    type="button"
    className="text-sm text-blue-600 mt-1"
    onClick={() => {
      sigPadRef.current?.clear();
      handleChange('signature', '');
    }}
  >
    Clear Signature
  </button>
</div>


      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

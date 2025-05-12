import React from 'react';
import fieldDisplayMap from '../data/fieldDisplayMap';
import medicalHistoryLayout from '../data/medicalHistoryLayout';

export default function MedicalHistoryForm({ fieldValues, handleChange, sigPadRef, submitting, handleSubmit }) {
  const renderRadioGroup = (label, idx) => (
    <div key={idx} className="mb-4">
      <label className="block font-medium mb-1">{fieldDisplayMap[label] || label}</label>
      <div className="flex gap-4">
        <label>
          <input
            type="radio"
            name={label}
            value="Yes"
            checked={fieldValues[idx] === "Yes"}
            onChange={() => handleChange(idx, "Yes")}
          /> Yes
        </label>
        <label>
          <input
            type="radio"
            name={label}
            value="No"
            checked={fieldValues[idx] === "No"}
            onChange={() => handleChange(idx, "No")}
          /> No
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {medicalHistoryLayout.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{section.title}</h2>

          {/* Static note text if present */}
          {section.note && (
            <p className="text-sm text-gray-600 italic mb-2">{section.note}</p>
          )}

          <div className={section.columns === 2 ? "grid grid-cols-2 gap-4" : ""}>
            {section.fields.map((field, i) => {
              const idx = field.index;
              const label = fieldDisplayMap[field.name] || field.name;

              if (field.type === 'radio') {
                return renderRadioGroup(field.name, idx);
              }

              if (field.type === 'medication') {
                return (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      disabled
                      className="form-checkbox"
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={fieldValues[idx] || ''}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      placeholder={label}
                    />
                  </div>
                );
              }

              return (
                <div key={idx} className={section.columns === 2 ? "" : "mb-4"}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={fieldValues[idx] || ''}
                    onChange={(e) => handleChange(idx, e.target.value)}
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
        <label className="block text-sm font-medium mb-1">Patient/Guardian Signature</label>
        <div className="border border-gray-300 rounded">
          <canvas ref={sigPadRef} className="w-full h-32" />
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 mt-1"
          onClick={() => sigPadRef.current.clear()}
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


import React from 'react';
import fieldDisplayMap from '../data/fieldDisplayMap';



export default function MedicalHistoryForm({ fieldValues, handleChange, sigPadRef, submitting, handleSubmit }) {
  const renderRadioGroup = (label, idx) => (
    <div key={idx} className="mb-4">
      <label className="block font-medium mb-1">
  {fieldDisplayMap[label] || label}
</label>
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
      <h2 className="text-lg font-semibold mb-4">Emergency Contacts</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {["MedicalDoctor", "CityState", "ICEContact", "ICEPhone", "Relationship"].map((fieldName, idx) => (
          <div key={idx}>
           <label className="block text-sm font-medium mb-1">
  {fieldDisplayMap[fieldName] || fieldName}
</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={fieldValues[idx] || ''}
              onChange={(e) => handleChange(idx, e.target.value)}
            />
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Medications</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 10 }, (_, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Medication ${i + 1}`}
            className="border border-gray-300 rounded px-3 py-2"
            value={fieldValues[5 + i] || ''}
            onChange={(e) => handleChange(5 + i, e.target.value)}
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Allergies</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          "Allergy_Anesthetic", "Allergy_Aspirin", "Allergy_Codeine",
          "Allergy_Ibuprofen", "Allergy_Iodine", "Allergy_Latex",
          "Allergy_Penicillin", "Allergy_Sulfa"
        ].map((label, i) => renderRadioGroup(label, 15 + i))}
        <input
          type="text"
          placeholder="Other Allergy"
          className="col-span-2 border border-gray-300 rounded px-3 py-2"
          value={fieldValues[23] || ''}
          onChange={(e) => handleChange(23, e.target.value)}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">Medical Conditions</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          "Asthma", "BleedingProblems", "Cancer", "Diabetes", "HeartMurmur",
          "HeartTrouble", "HighBloodPressure", "JointReplacement",
          "KidneyDisease", "LiverDisease", "Pregnancy", "PsychiatricTreatment",
          "RheumaticFever", "SinusTrouble", "Stroke", "Ulcers"
        ].map((label, i) => renderRadioGroup(label, 24 + i))}
        <input
          type="text"
          placeholder="Other Condition"
          className="col-span-2 border border-gray-300 rounded px-3 py-2"
          value={fieldValues[40] || ''}
          onChange={(e) => handleChange(40, e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Signature</label>
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

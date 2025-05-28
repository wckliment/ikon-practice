import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const PendingForms = ({ patient, locationCode, onComplete }) => {
  const [forms, setForms] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const navigate = useNavigate();


const handleFormStart = (token) => {
  navigate(`/forms/fill/${token}?tablet=true&locationCode=${locationCode}`);
};

useEffect(() => {
  const fetchForms = async () => {
    try {
      const res = await axios.get(`/api/public-forms/pending/${patient.PatNum}`);
      const serverForms = res.data || [];

      const localQueue = JSON.parse(localStorage.getItem("pendingTabletForms")) || [];
      const fullName = `${patient.FName} ${patient.LName}`.toLowerCase().trim();

      const matchedLocalForms = localQueue.filter(
        (form) => form.patientName.toLowerCase().trim() === fullName
      );

      setForms([...serverForms, ...matchedLocalForms]);
    } catch (err) {
      console.error("Failed to fetch forms:", err);
      setForms([]);
    } finally {
      setFetchedOnce(true);
    }
  };

  fetchForms();
}, [patient.PatNum, patient.FName, patient.LName]);


useEffect(() => {
  if (fetchedOnce && forms.length === 0) {
    // Remove any lingering forms from localStorage for this patient now
    const fullName = `${patient.FName} ${patient.LName}`.toLowerCase().trim();
    const localQueue = JSON.parse(localStorage.getItem("pendingTabletForms")) || [];
    const remainingQueue = localQueue.filter(
      (form) => form.patientName.toLowerCase().trim() !== fullName
    );
    localStorage.setItem("pendingTabletForms", JSON.stringify(remainingQueue));

    onComplete();
  }
}, [fetchedOnce, forms, onComplete, patient.FName, patient.LName]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">📋 Forms to Complete</h2>
      <p className="text-center text-gray-600 mb-6">Tap a form to begin:</p>
      <div className="space-y-4 max-w-xl mx-auto">
        {forms.map((form) => (
          <div key={form.token} className="bg-white rounded shadow p-4 flex justify-between items-center">
            <span className="text-lg">{form.description || form.formName || form.form_name || "Untitled Form"}</span>
            <button
              onClick={() => handleFormStart(form.token)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingForms;

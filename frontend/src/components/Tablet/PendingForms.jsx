import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PendingForms = ({ patient, locationCode, onComplete }) => {
  const [forms, setForms] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false); // ✅ Track fetch state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get(`/api/public-forms/pending/${patient.PatNum}`);
        setForms(res.data || []);
      } catch (err) {
        console.error("Failed to fetch forms:", err);
        setForms([]); // still set it to avoid hanging state
      } finally {
        setFetchedOnce(true); // ✅ Mark that fetch attempt is complete
      }
    };

    fetchForms();
  }, [patient.PatNum]);

  useEffect(() => {
    if (fetchedOnce && forms.length === 0) {
      onComplete(); // ✅ Safe to trigger navigation now
    }
  }, [fetchedOnce, forms, onComplete]);

  const handleFormStart = (token) => {
    navigate(`/tablet-checkin/${locationCode}/form/${token}`);
  };

  if (!fetchedOnce) {
    return <div className="text-center mt-10 text-gray-500">Loading forms...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">📋 Forms to Complete</h2>
      <p className="text-center text-gray-600 mb-6">Tap a form to begin:</p>
      <div className="space-y-4 max-w-xl mx-auto">
        {forms.map((form) => (
          <div key={form.token} className="bg-white rounded shadow p-4 flex justify-between items-center">
            <span className="text-lg">{form.description || "Untitled Form"}</span>
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


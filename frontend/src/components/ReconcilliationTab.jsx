import React, { useEffect, useState } from "react";
import axios from "axios";

const ReconcilliationTab = ({ selectedPatient }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPatient?.PatNum) return;

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/reconcilliation/${selectedPatient.PatNum}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEntries(res.data);
      } catch (err) {
        console.error("Failed to fetch reconciliation entries:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedPatient]);

  const handleResolve = async (entryId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`/api/reconcilliation/${entryId}/resolve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      console.error("❌ Failed to resolve entry:", err.message);
    }
  };

  if (!selectedPatient) return null;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Reconciliation for {selectedPatient.FName} {selectedPatient.LName}
      </h2>

      {loading ? (
        <p>Loading reconciliation entries...</p>
      ) : entries.length === 0 ? (
        <p>No unresolved entries for this patient.</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Field</th>
              <th className="px-3 py-2 text-left">Original</th>
              <th className="px-3 py-2 text-left">Submitted</th>
              <th className="px-3 py-2 text-left">Form</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className="border-t">
                <td className="px-3 py-2">{entry.field_name}</td>
                <td className="px-3 py-2 text-gray-500">{entry.original_value || "—"}</td>
                <td className="px-3 py-2 font-medium">{entry.submitted_value}</td>
                <td className="px-3 py-2">{entry.form_name}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleResolve(entry.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReconcilliationTab;

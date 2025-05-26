import React, { useEffect, useState } from "react";
import axios from "axios";

const ReconcilliationTab = ({ patientId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/reconcilliation/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntries(res.data);
      } catch (err) {
        console.error("Failed to fetch reconciliation entries:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [patientId]);


  const truncateValue = (value) => {
  if (!value) return "(empty)";
  if (value.startsWith("data:image")) return "[Signature Image]";
  return value.length > 100 ? value.slice(0, 100) + "..." : value;
};

  const handleResolve = async (entryId) => {
    const confirm = window.confirm("Are you sure you want to accept this updated value?");
    if (!confirm) return;

    setResolvingId(entryId);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/reconcilliation/${entryId}/resolve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, resolved: true } // Soft-mark as resolved
            : entry
        )
      );
    } catch (err) {
      console.error("❌ Failed to resolve entry:", err.message);
      setError("Something went wrong while updating. Please try again.");
    } finally {
      setResolvingId(null);
    }
  };

    const handleReject = async (entryId) => {
  try {
    setResolvingId(entryId);
    const token = localStorage.getItem("token");
    await axios.patch(`/api/reconcilliation/${entryId}/reject`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  } catch (err) {
    console.error("❌ Failed to reject entry:", err.message);
  } finally {
    setResolvingId(null);
  }
};


  if (!patientId) return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Reconciliation Needed</h2>

      {loading ? (
        <p className="text-gray-500">Loading reconciliation entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No unresolved entries for this patient.</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Field</th>
              <th className="px-4 py-2 text-left text-blue-800">Submitted</th>
              <th className="px-4 py-2 text-left text-gray-500">Original</th>
              <th className="px-4 py-2 text-left">Form</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={`border-t ${
                  entry.resolved ? "bg-green-50 text-green-700" : ""
                }`}
              >
                <td className="px-4 py-2 font-medium">{entry.field_name}</td>
               <td className="px-4 py-2 text-blue-700">{truncateValue(entry.submitted_value)}</td>
<td className="px-4 py-2 text-gray-500">{truncateValue(entry.original_value)}</td>
                <td className="px-4 py-2">{entry.form_name}</td>
                <td className="px-4 py-2">

                        {entry.resolved ? (
  <span className="text-green-600 font-semibold">Accepted</span>
) : (
  <div className="flex space-x-2">
    <button
      disabled={resolvingId === entry.id}
      onClick={() => handleResolve(entry.id)}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
    >
      {resolvingId === entry.id ? "Updating..." : "Accept"}
    </button>
    <button
      disabled={resolvingId === entry.id}
      onClick={() => handleReject(entry.id)}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
    >
      Reject
    </button>
  </div>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && (
        <div className="text-red-600 mt-4 font-medium text-sm">{error}</div>
      )}
    </div>
  );
};

export default ReconcilliationTab;

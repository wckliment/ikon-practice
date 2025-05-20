import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const fetchForms = async () => {
  try {
    const res = await axios.get("/api/forms", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    setForms(res.data || []);
  } catch (err) {
    console.error("❌ Failed to fetch form templates:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchForms();
}, []);



const handleDelete = async (formId) => {
  const confirmed = window.confirm("Are you sure you want to delete this form?");
  if (!confirmed) return;

  try {
    await axios.delete(`/api/forms/${formId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    toast.success("🗑 Form deleted");
    fetchForms();
  } catch (err) {
    console.error("❌ Failed to delete form:", err);
    toast.error("Failed to delete form.");
  }
};


  return (
    <div className="p-6">
      <div className="grid grid-cols-3 items-center mb-6">
  <div>
    <button
      onClick={() => navigate("/forms")}
      className="text-blue-600 hover:underline text-sm"
    >
      ← Go Back to Forms
    </button>
  </div>

  <div className="text-center mt-12">
    <h1 className="text-3xl font-bold text-gray-800">Form Management</h1>
  </div>

  <div className="flex justify-end">
    <button
      onClick={() => navigate("/forms/builder")}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      ➕ Create New Form
    </button>
  </div>
</div>

      {loading ? (
        <p>Loading forms...</p>
      ) : forms.length === 0 ? (
        <p className="text-gray-500">No form templates found.</p>
      ) : (
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Form Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Created
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id} className="border-t">
                <td className="px-4 py-2 text-sm">{form.name}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(form.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm space-x-2">
                  <button
                    onClick={() => navigate(`/forms/builder?id=${form.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

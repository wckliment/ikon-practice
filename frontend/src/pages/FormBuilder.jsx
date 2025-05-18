// frontend/src/pages/FormBuilder.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function FormBuilder() {
  const [formName, setFormName] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [fields, setFields] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);

  const handleAddField = () => {
    if (!label.trim()) {
      toast.error("Label is required.");
      return;
    }

    const newField = {
      label,
      fieldType,
      required: fieldType !== "static_text" ? required : false,
      options: fieldType === "radio" || fieldType === "checkbox" ? ["Yes", "No"] : null,
    };

    setFields([...fields, newField]);
    setLabel("");
    setFieldType(fieldType === "static_text" ? "static_text" : "text");
    setRequired(false);
  };

  const handleSaveForm = async () => {
    if (!formName.trim() || fields.length === 0) {
      toast.error("Form name and at least one field are required.");
      return;
    }

    try {
        const userId = currentUser?.id;

      const payload = {
        name: formName,
        description: "",
        created_by: userId || 1,
        fields: fields.map((f, index) => ({
          label: f.label,
          field_type: f.fieldType,
          is_required: f.required,
          field_order: index + 1,
          options: f.options || null,
        })),
      };

      await axios.post("/api/forms", payload);
      toast.success("✅ Form saved!");
      setFormName("");
      setFields([]);
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error("Failed to save form.");
    }
  };

  const moveField = (index, direction) => {
    const updated = [...fields];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setFields(updated);
  };

  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Panel - Add New Field */}
      <div className="border p-4 rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">🧱 Add New Field</h2>

        <label className="block font-medium mb-1">📝 Form Name:</label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4"
          placeholder="Enter a title like 'Medical History'"
        />

        <label className="block font-medium mb-1">Label:</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3"
        />

        <label className="block font-medium mb-1">Field Type:</label>
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3"
        >
          <option value="text">text</option>
          <option value="radio">radio</option>
          <option value="checkbox">checkbox</option>
          <option value="textarea">textarea</option>
          <option value="signature">signature</option>
          <option value="static_text">static text</option>
        </select>

      {fieldType !== "static_text" && (
  <div className="flex items-center mb-3">
    <input
      type="checkbox"
      checked={required}
      onChange={(e) => setRequired(e.target.checked)}
      className="mr-2"
    />
    <label>Required</label>
  </div>
)}


        <button
          onClick={handleAddField}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Field
        </button>
      </div>

 {/* Right Panel - Preview */}
<div className="border p-4 rounded shadow bg-white">
  <h2 className="text-lg font-semibold mb-1">📋 Field Preview</h2>
  {formName && (
    <div className="text-blue-700 font-semibold text-md mb-3">
      📝 {formName}
    </div>
  )}

  {fields.length === 0 ? (
    <p className="text-gray-500">No fields added yet.</p>
  ) : (
    <ul className="space-y-2">
      {fields.map((field, index) => (
        <li
          key={index}
          className="border p-2 rounded flex justify-between items-center"
        >
        {field.fieldType === "static_text" ? (
  <span className="italic text-gray-700">
    📌 Static Text: “{field.label}”
  </span>
) : (
  <span>
    {index + 1}. {field.label} ({field.fieldType})
    {field.options && (
      <span className="ml-2 text-sm text-gray-600">
        - {field.options.join(", ")}
      </span>
    )}
  </span>
)}
          <div className="space-x-1">
            <button
              onClick={() => moveField(index, -1)}
              className="px-2 py-1 bg-gray-300 rounded"
            >
              ⬆
            </button>
            <button
              onClick={() => moveField(index, 1)}
              className="px-2 py-1 bg-gray-300 rounded"
            >
              ⬇
            </button>
            <button
              onClick={() => removeField(index)}
              className="px-2 py-1 bg-red-400 text-white rounded"
            >
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}

  <div className="mt-6 flex justify-end gap-2">
    <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
      🔄 Preview Form
    </button>
    <button
      onClick={handleSaveForm}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      💾 Save Form
    </button>
  </div>
</div>

    </div>
  );
}

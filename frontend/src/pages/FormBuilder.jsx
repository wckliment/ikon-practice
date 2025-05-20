import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function FormBuilder() {
  const [formName, setFormName] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [sections, setSections] = useState([
    { sectionTitle: "Untitled Section 1", fields: [] }
  ]);
  const [selectedSection, setSelectedSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editFormId = searchParams.get("id");
  const [optionsText, setOptionsText] = useState("");


 const handleAddField = () => {
  if (!label.trim()) {
    toast.error("Label is required.");
    return;
  }

  const newField = {
    label,
    fieldType,
    required: fieldType !== "static_text" ? required : false,
    options:
      fieldType === "radio" || fieldType === "checkbox"
        ? optionsText.split(",").map((o) => o.trim())
        : null,
  };

  const updatedSections = [...sections];

  if (
    selectedSection === null ||
    isNaN(selectedSection) ||
    !updatedSections[selectedSection]
  ) {
    toast.error("Please select a valid section.");
    return;
  }

  const updatedFields = [
    ...updatedSections[selectedSection].fields,
    newField,
  ];

  updatedSections[selectedSection] = {
    ...updatedSections[selectedSection],
    fields: updatedFields,
  };

  setSections(updatedSections);

  // ✅ Clear input states after adding field
  setLabel("");
  setFieldType("text");
  setRequired(false);
  setOptionsText(""); // <--- Clear the options input
};


  const handleAddSection = () => {
    setSections([
      ...sections,
      { sectionTitle: `Untitled Section ${sections.length + 1}`, fields: [] }
    ]);
    setSelectedSection(sections.length);
  };

  const handleSaveForm = async () => {
  if (!formName.trim() || sections.every(sec => sec.fields.length === 0)) {
    toast.error("Form name and at least one field are required.");
    return;
  }

  try {
    const userId = currentUser?.id;
    const payload = {
      name: formName,
      description: "",
      created_by: userId || 1,
      fields: sections.flatMap((section, sectionIdx) =>
        section.fields.map((f, fieldIdx) => ({
          label: f.label,
          field_type: f.fieldType,
          is_required: f.required,
          field_order: fieldIdx + 1,
          section_title: section.sectionTitle,
          options: f.options || null,
        }))
      ),
    };

    const endpoint = editFormId ? `/api/forms/${editFormId}` : "/api/forms";
    const method = editFormId ? "put" : "post";

    await axios[method](endpoint, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    toast.success(editFormId ? "✅ Form updated!" : "✅ Form saved!");
    setFormName("");
    setSections([{ sectionTitle: "Untitled Section 1", fields: [] }]);
    navigate("/forms/manage");
  } catch (err) {
    console.error("❌ Save failed:", err);
    toast.error("Failed to save form.");
  }
};


const moveFieldUp = (sectionIdx, fieldIdx) => {
  const updated = [...sections];
  const fields = updated[sectionIdx].fields;
  if (fieldIdx > 0) {
    [fields[fieldIdx - 1], fields[fieldIdx]] = [fields[fieldIdx], fields[fieldIdx - 1]];
    setSections(updated);
  }
};

const moveFieldDown = (sectionIdx, fieldIdx) => {
  const updated = [...sections];
  const fields = updated[sectionIdx].fields;
  if (fieldIdx < fields.length - 1) {
    [fields[fieldIdx + 1], fields[fieldIdx]] = [fields[fieldIdx], fields[fieldIdx + 1]];
    setSections(updated);
  }
};

  useEffect(() => {
  const loadForm = async () => {
    if (!editFormId) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`/api/forms/${editFormId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const { form, fields } = res.data;
      setFormName(form.name || "");

      // Convert flat field list back into grouped sections
      const grouped = [];
      fields.forEach(field => {
        const sec = field.section_title || "Untitled Section";
        let section = grouped.find(s => s.sectionTitle === sec);
        if (!section) {
          section = { sectionTitle: sec, fields: [] };
          grouped.push(section);
        }

        section.fields.push({
          label: field.label,
          fieldType: field.field_type,
          required: field.is_required === 1,
          options: field.options || null,
        });
      });

      setSections(grouped);
    } catch (err) {
      console.error("❌ Failed to load form:", err);
      toast.error("Failed to load form for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  loadForm();
}, [editFormId]);




  return (
    <>
  <div className="grid grid-cols-3 items-center mb-6 px-6 mt-12">
    <div>
      <button
        onClick={() => navigate("/forms/manage")}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Go Back to Form Management
      </button>
    </div>

    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800">Form Builder</h1>
    </div>

    <div></div>
  </div>

  {isLoading && (
    <p className="text-center text-sm text-gray-500 mb-4">Loading form...</p>
  )}

  {editFormId && (
    <div className="text-center text-yellow-700 font-semibold mb-4">
      🛠️ Editing Form: {formName || `ID ${editFormId}`}
    </div>
  )}

    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border p-4 rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">Add New Field</h2>

        <label className="block font-medium mb-1">Form Name:</label>
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
          <option value="date">date</option>
        </select>

        <label className="block font-medium mb-1">Assign to Section:</label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded mb-3"
        >
          {sections.map((sec, idx) => (
            <option key={idx} value={idx}>
              {sec.sectionTitle || `Untitled Section ${idx + 1}`}
            </option>
          ))}
        </select>

    {fieldType !== "static_text" && (
  <>
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        checked={required}
        onChange={(e) => setRequired(e.target.checked)}
        className="mr-2"
      />
      <label>Required</label>
    </div>

    {(fieldType === "checkbox" || fieldType === "radio") && (
      <div className="mb-3">
        <label className="block font-medium mb-1">Options (comma separated):</label>
        <input
          type="text"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="e.g. Email and Text, Email Only, Text Only, None"
        />
      </div>
    )}
  </>
)}


        <button
          onClick={handleAddField}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Field
        </button>

        <button
          onClick={handleAddSection}
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Section
        </button>
      </div>

      <div className="border p-4 rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-1">Field Preview</h2>
        {formName && (
          <div className="text-blue-700 font-semibold text-md mb-3">
            {formName}
          </div>
        )}

        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={section.sectionTitle}
                onChange={(e) => {
                  const updated = [...sections];
                  updated[sectionIdx].sectionTitle = e.target.value;
                  setSections(updated);
                }}
                className="text-md font-bold text-blue-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full mr-2"
                placeholder={`Untitled Section ${sectionIdx + 1}`}
              />
              {sections.length > 1 && (
                <button
                  onClick={() => {
                    const updated = sections.filter((_, idx) => idx !== sectionIdx);
                    setSections(updated);
                    if (selectedSection >= updated.length) setSelectedSection(0);
                  }}
                  className="text-red-600 text-sm px-2 py-1 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>

            {section.fields.length === 0 ? (
              <p className="text-gray-400 italic">No fields in this section yet.</p>
            ) : (
              <ul className="space-y-2">
                {section.fields.map((field, index) => (
                  <li key={index} className="border p-2 rounded space-y-1">
                    <span>
                      {index + 1}. {field.label} ({field.fieldType})
                      {field.options && (
                        <span className="ml-2 text-sm text-gray-600">
                          - {field.options.join(", ")}
                        </span>
                      )}
                    </span>

                    {field.fieldType === "text" && (
                      <input type="text" className="border px-2 py-1 w-full" disabled />
                    )}

                    {field.fieldType === "textarea" && (
                      <textarea className="border px-2 py-1 w-full" disabled />
                    )}

                    {field.fieldType === "checkbox" && (
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" disabled />
                        <span>Check here</span>
                      </label>
                    )}

                    {field.fieldType === "radio" && (
                      <div className="flex gap-4">
                        {field.options?.map((option, idx) => (
                          <label key={idx} className="flex items-center space-x-1">
                            <input type="radio" name={`radio-${index}`} disabled />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.fieldType === "date" && (
                      <input type="date" className="border px-2 py-1 w-full" disabled />
                    )}

                    {field.fieldType === "signature" && (
                      <div className="border border-dashed px-2 py-6 text-center text-gray-500">
                        Signature Pad (preview)
                      </div>
                    )}

                    {field.fieldType === "static_text" && (
                      <div className="bg-gray-100 p-2 italic text-gray-700">{field.label}</div>
                    )}

<div className="flex justify-end space-x-1 pt-1">
  <button
    onClick={() => moveFieldUp(sectionIdx, index)}
    disabled={index === 0}
    className="px-2 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
  >
    ⬆
  </button>
  <button
    onClick={() => moveFieldDown(sectionIdx, index)}
    disabled={index === section.fields.length - 1}
    className="px-2 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
  >
    ⬇
  </button>
  <button
    onClick={() => {
      const updated = [...sections];
      updated[sectionIdx].fields.splice(index, 1);
      setSections(updated);
    }}
    className="px-2 py-1 bg-red-400 text-white text-sm rounded"
  >
    🗑 Delete
  </button>
</div>


                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="mt-6 flex justify-end gap-2">
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
            Preview Form
          </button>
            <button
  onClick={handleSaveForm}
  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
  disabled={isLoading}
>
  {isLoading ? "Saving..." : "Save Form"}
</button>
        </div>
      </div>
      </div>
      </>
  );
}

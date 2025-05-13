import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

const ConsentForm = ({ fieldValues, handleChange, staticText, fieldLabels, fields }) => {
  const sigPadRef = useRef(null);

  // Load signature if already present
useEffect(() => {
  if (sigPadRef.current && fieldValues.signature) {
    try {
      sigPadRef.current.fromDataURL(fieldValues.signature);
    } catch (err) {
      console.warn("⚠️ Failed to load existing signature:", err);
    }
  }
  // empty dependency array = run once on mount
}, []);

const handleSignatureEnd = () => {
  if (!sigPadRef.current) return;

  const dataURL = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");

  // Prevent redundant state updates (which cause re-render artifacts)
  if (fieldValues.signature !== dataURL) {
    handleChange("signature", dataURL);
  }
};


  return (
    <div className="space-y-6">
      {/* Top Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields
          .filter(field => field.FieldType !== "SigBox") // Skip SigBox here
          .map((field) => (
            <div key={field.FieldName}>
              <label className="block font-semibold mb-1">
                {fieldLabels[field.FieldName] || field.FieldName}
              </label>
              <input
                type="text"
                name={field.FieldName}
                value={fieldValues[field.FieldName] || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
        ))}
      </div>

      {/* Static Text Block */}
      <div className="border border-gray-300 p-4 rounded bg-gray-50 whitespace-pre-wrap">
        {staticText}
      </div>

      {/* Signature Pad */}
      <div className="mt-6">
        <label className="block font-semibold mb-2">Signature</label>
        <SignatureCanvas
  penColor="black"
  canvasProps={{
    className: "w-full h-32 border rounded bg-white",
    style: { touchAction: "none" }
  }}
  ref={sigPadRef}
  onEnd={handleSignatureEnd}
/>
        <button
          type="button"
        onClick={() => {
  sigPadRef.current.clear();
  handleChange("signature", "");
}}
          className="mt-2 text-sm text-blue-600"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
};

export default ConsentForm;

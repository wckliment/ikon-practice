export const formTemplates = {
  "Extraction Consent": [
    {
    FieldName: "dateTime.Today",
    FieldType: "InputField",
    IsRequired: true
  },
  {
    FieldName: "patient.nameFL",
    FieldType: "InputField",
    IsRequired: true
  },
  {
    FieldName: "Tooth number(s):",
    FieldType: "InputField",
    IsRequired: true
  },
  {
    FieldName: "Signature Box",
    FieldType: "SigBox",
    IsRequired: true
  },
  {
    FieldName: "Signature",
    FieldType: "InputField",
    IsRequired: true
  }
],

  "Medical History": [
    { FieldName: "Allergies", FieldType: "InputField", IsRequired: false },
    { FieldName: "Current Medications", FieldType: "InputField", IsRequired: false },
    { FieldName: "Signature", FieldType: "SigBox", IsRequired: true }
  ]
};

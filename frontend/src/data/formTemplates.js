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
      FieldName: "toothNum",
      FieldType: "InputField",
      IsRequired: true
    },
    {
      FieldName: "signature", // ✅ FIXED: no longer empty
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
    {
      FieldName: "Allergies",
      FieldType: "InputField",
      IsRequired: false
    },
    {
      FieldName: "Current Medications",
      FieldType: "InputField",
      IsRequired: false
    },
    {
      FieldName: "signature", // ✅ FIXED here too
      FieldType: "SigBox",
      IsRequired: true
    },
    {
      FieldName: "Signature",
      FieldType: "InputField",
      IsRequired: true
    }
  ]
};


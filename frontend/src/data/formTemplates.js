export const formTemplates = {
  "Extraction Consent": {
    openDentalOnly: false,
    fields: [
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
        FieldName: "signature",
        FieldType: "SigBox",
        IsRequired: true
      }
    ]
  },

  "Medical History": {
    openDentalOnly: false,
    fields: [
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
        FieldName: "signature",
        FieldType: "SigBox",
        IsRequired: true
      }
    ]
  },

  "Excuse Letter": {
    openDentalOnly: false,
    fields: [
      {
        FieldName: "today.DayDate",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "PracticeTitle",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "PracticeAddress",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "practiceCityStateZip",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "patient.nameFL",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "patient.address",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "patient.cityStateZip",
        FieldType: "InputField",
        IsRequired: false
      },
      {
        FieldName: "patient.priProvNameFL",
        FieldType: "InputField",
        IsRequired: false
      }
    ]
  }
};

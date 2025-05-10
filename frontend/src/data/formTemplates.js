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
    { FieldName: "MedicalDoctor", FieldType: "InputField", IsRequired: false },
    { FieldName: "CityState", FieldType: "InputField", IsRequired: false },
    { FieldName: "ICEContact", FieldType: "InputField", IsRequired: false },
    { FieldName: "ICEPhone", FieldType: "InputField", IsRequired: false },
    { FieldName: "Relationship", FieldType: "InputField", IsRequired: false },

    // Medications
    { FieldName: "inputMed1", FieldType: "InputField" },
    { FieldName: "inputMed2", FieldType: "InputField" },
    { FieldName: "inputMed3", FieldType: "InputField" },
    { FieldName: "inputMed4", FieldType: "InputField" },
    { FieldName: "inputMed5", FieldType: "InputField" },
    { FieldName: "inputMed6", FieldType: "InputField" },
    { FieldName: "inputMed7", FieldType: "InputField" },
    { FieldName: "inputMed8", FieldType: "InputField" },
    { FieldName: "inputMed9", FieldType: "InputField" },
    { FieldName: "inputMed10", FieldType: "InputField" },

    // Allergies
    { FieldName: "Allergy_Anesthetic", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Aspirin", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Codeine", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Ibuprofen", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Iodine", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Latex", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Penicillin", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Sulfa", FieldType: "RadioGroup" },
    { FieldName: "Allergy_Other", FieldType: "InputField" },

    // Medical Conditions
    { FieldName: "Asthma", FieldType: "RadioGroup" },
    { FieldName: "BleedingProblems", FieldType: "RadioGroup" },
    { FieldName: "Cancer", FieldType: "RadioGroup" },
    { FieldName: "Diabetes", FieldType: "RadioGroup" },
    { FieldName: "HeartMurmur", FieldType: "RadioGroup" },
    { FieldName: "HeartTrouble", FieldType: "RadioGroup" },
    { FieldName: "HighBloodPressure", FieldType: "RadioGroup" },
    { FieldName: "JointReplacement", FieldType: "RadioGroup" },
    { FieldName: "KidneyDisease", FieldType: "RadioGroup" },
    { FieldName: "LiverDisease", FieldType: "RadioGroup" },
    { FieldName: "Pregnancy", FieldType: "RadioGroup" },
    { FieldName: "PsychiatricTreatment", FieldType: "RadioGroup" },
    { FieldName: "RheumaticFever", FieldType: "RadioGroup" },
    { FieldName: "SinusTrouble", FieldType: "RadioGroup" },
    { FieldName: "Stroke", FieldType: "RadioGroup" },
    { FieldName: "Ulcers", FieldType: "RadioGroup" },
    { FieldName: "MedicalCondition_Other", FieldType: "InputField" },

    // Signature
    { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
  ]
}
,

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
  },

  "HIPAA": {
    openDentalOnly: false,
    fields: [
      {
        FieldName: "signature",
        FieldType: "SigBox",
        IsRequired: true
      }
    ]
  }
};

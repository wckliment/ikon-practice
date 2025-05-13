export const formTemplates = {
  "Extraction Consent": {
    openDentalOnly: false,
    fields: [
      { FieldName: "dateTime.Today", FieldType: "InputField", IsRequired: true },
      { FieldName: "patient.nameFL", FieldType: "InputField", IsRequired: true },
      { FieldName: "toothNum", FieldType: "InputField", IsRequired: true },
      { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
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
      ...Array.from({ length: 10 }, (_, i) => ({
        FieldName: `inputMed${i + 1}`,
        FieldType: "InputField"
      })),

      // Allergies
      ...[
        "Allergy_Anesthetic", "Allergy_Aspirin", "Allergy_Codeine", "Allergy_Ibuprofen",
        "Allergy_Iodine", "Allergy_Latex", "Allergy_Penicillin", "Allergy_Sulfa"
      ].map(name => ({ FieldName: name, FieldType: "RadioGroup" })),
      { FieldName: "Allergy_Other", FieldType: "InputField" },

      // Conditions
      ...[
        "Asthma", "BleedingProblems", "Cancer", "Diabetes", "HeartMurmur",
        "HeartTrouble", "HighBloodPressure", "JointReplacement",
        "KidneyDisease", "LiverDisease", "Pregnancy", "PsychiatricTreatment",
        "RheumaticFever", "SinusTrouble", "Stroke", "Ulcers"
      ].map(name => ({ FieldName: name, FieldType: "RadioGroup" })),
      { FieldName: "MedicalCondition_Other", FieldType: "InputField" },

      // Signature
      { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
    ]
  },

  "Excuse Letter": {
    openDentalOnly: false,
    fields: [
      { FieldName: "today.DayDate", FieldType: "InputField", IsRequired: false },
      { FieldName: "PracticeTitle", FieldType: "InputField", IsRequired: false },
      { FieldName: "PracticeAddress", FieldType: "InputField", IsRequired: false },
      { FieldName: "practiceCityStateZip", FieldType: "InputField", IsRequired: false },
      { FieldName: "patient.nameFL", FieldType: "InputField", IsRequired: false },
      { FieldName: "patient.address", FieldType: "InputField", IsRequired: false },
      { FieldName: "patient.cityStateZip", FieldType: "InputField", IsRequired: false },
      { FieldName: "patient.priProvNameFL", FieldType: "InputField", IsRequired: false }
    ]
  },

    "Registration/HIPAA  Form2": {
    openDentalOnly: false,
    fields: [
      // Basic Info
      { FieldName: "LName", FieldType: "InputField" },
      { FieldName: "FName", FieldType: "InputField" },
      { FieldName: "MiddleI", FieldType: "InputField" },
      { FieldName: "Preferred", FieldType: "InputField" },
      { FieldName: "Birthdate", FieldType: "InputField" },
      { FieldName: "SSN", FieldType: "InputField" },
      {
        FieldName: "Gender",
        FieldType: "Select",
        options: ["M", "F"]
      },
      {
        FieldName: "Position",
        FieldType: "RadioButton",
        options: ["Yes", "No"]
      },
      { FieldName: "WkPhone", FieldType: "InputField" },
      { FieldName: "WirelessPhone", FieldType: "InputField" },
      { FieldName: "HmPhone", FieldType: "InputField" },
      { FieldName: "Email", FieldType: "InputField" },

      // Contact Preferences
      {
        FieldName: "PreferContactMethod",
        FieldType: "Select",
        options: ["Home Phone", "Work Phone", "Wireless Phone", "Email", "Text Message"]
      },
      {
        FieldName: "PreferConfirmMethod",
        FieldType: "Select",
        options: ["Home Phone", "Work Phone", "Wireless Phone", "Email", "Text Message"]
      },
      {
        FieldName: "PreferRecallMethod",
        FieldType: "Select",
        options: ["Home Phone", "Work Phone", "Wireless Phone", "Email", "Text Message"]
      },

      // Student
      {
        FieldName: "StudentStatus",
        FieldType: "Select",
        options: ["Non-Student", "Full Time", "Part Time"]
      },

      // Referral Source
      {
        FieldName: "referredFrom",
        FieldType: "Select",
        options: ["Google", "Facebook", "Medicaid", "Insurance", "Cherry Payment Plan"]
      },

      // Address
      { FieldName: "Address", FieldType: "InputField" },
      { FieldName: "Address2", FieldType: "InputField" },
      { FieldName: "City", FieldType: "InputField" },
      { FieldName: "State", FieldType: "InputField" },
      { FieldName: "Zip", FieldType: "InputField" },

      // Insurance 1
      {
        FieldName: "ins1Relat",
        FieldType: "Select",
        options: ["Self", "Spouse", "Child"]
      },
      { FieldName: "ins1SubscriberNameF", FieldType: "InputField" },
      { FieldName: "ins1SubscriberID", FieldType: "InputField" },
      { FieldName: "ins1CarrierName", FieldType: "InputField" },
      { FieldName: "ins1CarrierPhone", FieldType: "InputField" },
      { FieldName: "ins1EmployerName", FieldType: "InputField" },
      { FieldName: "ins1GroupName", FieldType: "InputField" },
      { FieldName: "ins1GroupNum", FieldType: "InputField" },

      // Insurance 2
      {
        FieldName: "ins2Relat",
        FieldType: "Select",
        options: ["Self", "Spouse", "Child"]
      },
      { FieldName: "ins2SubscriberNameF", FieldType: "InputField" },
      { FieldName: "ins2SubscriberID", FieldType: "InputField" },
      { FieldName: "ins2CarrierName", FieldType: "InputField" },
      { FieldName: "ins2CarrierPhone", FieldType: "InputField" },
      { FieldName: "ins2EmployerName", FieldType: "InputField" },
      { FieldName: "ins2GroupName", FieldType: "InputField" },
      { FieldName: "ins2GroupNum", FieldType: "InputField" },

      // Authorized Parties
     { FieldName: "misc", FieldType: "InputField", IsRequired: false },
      // Signature
      { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
    ]
  },

  "HIPAA": {
    openDentalOnly: false,
    fields: [
      { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
    ]
  },

  "Dental Insurance Secural/IAO": {
  openDentalOnly: false,
  fields: [
    { FieldName: "dateToday", FieldType: "InputField", IsRequired: false },
    { FieldName: "FName", FieldType: "InputField", IsRequired: true },
    { FieldName: "LName", FieldType: "InputField", IsRequired: true },
    { FieldName: "Birthdate", FieldType: "InputField", IsRequired: true },
    { FieldName: "toothNum", FieldType: "InputField", IsRequired: false },

    // Credit card section
    { FieldName: "CreditCardNumber", FieldType: "InputField", IsRequired: false },
    { FieldName: "ExpDate", FieldType: "InputField", IsRequired: false },
    { FieldName: "CVV", FieldType: "InputField", IsRequired: false },
    { FieldName: "BillingAddress", FieldType: "InputField", IsRequired: false },
    { FieldName: "City", FieldType: "InputField", IsRequired: false },
    { FieldName: "State", FieldType: "InputField", IsRequired: false },
    { FieldName: "ZipCode", FieldType: "InputField", IsRequired: false },

    // Signature
    { FieldName: "signature", FieldType: "SigBox", IsRequired: true }
  ]
}

};

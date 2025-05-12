const medicalHistoryLayout = [
  {
    title: "Emergency Contacts",
    columns: 2,
    fields: [
      { name: "MedicalDoctor" },
      { name: "CityState" },
      { name: "ICEContact" },
      { name: "ICEPhone" },
      { name: "Relationship" }
    ]
  },
  {
    title: "Medications",
    columns: 2,
    note: "**EXISTING PATIENTS** Check the box next to any medication no longer being taken.",
    fields: Array.from({ length: 10 }, (_, i) => ({
      name: `inputMed${i + 1}`,
      type: "medication"
    }))
  },
  {
    title: "Allergies",
    columns: 2,
    note: "Are you allergic to any of the following?",
    fields: [
      ...[
        "Allergy_Anesthetic", "Allergy_Aspirin", "Allergy_Codeine", "Allergy_Ibuprofen",
        "Allergy_Iodine", "Allergy_Latex", "Allergy_Penicillin", "Allergy_Sulfa"
      ].map(name => ({ name, type: "radio" })),
      { name: "Allergy_Other" }
    ]
  },
  {
    title: "Medical Conditions",
    columns: 2,
    note: "Do you have any of the following medical conditions?",
    fields: [
      ...[
        "Asthma", "BleedingProblems", "Cancer", "Diabetes", "HeartMurmur",
        "HeartTrouble", "HighBloodPressure", "JointReplacement",
        "KidneyDisease", "LiverDisease", "Pregnancy", "PsychiatricTreatment",
        "RheumaticFever", "SinusTrouble", "Stroke", "Ulcers"
      ].map(name => ({ name, type: "radio" })),
      { name: "MedicalCondition_Other" }
    ]
  },
  {
    title: "Today’s Visit",
    columns: 1,
    fields: [
      { name: "TobaccoUse" },
      { name: "InjectionReactions" },
      { name: "ReasonForVisit" },
      { name: "AreYouInPain" }
    ]
  },
  {
    title: "New Patients",
    columns: 1,
    note: "New Patients:",
    fields: [
      { name: "PanoramicXRays" },
      { name: "BiteWingXRays" },
      { name: "FormerDentist" },
      { name: "FormerDentistCityState" },
      { name: "DateOfLastCleaning" }
    ]
  }
];

export default medicalHistoryLayout;

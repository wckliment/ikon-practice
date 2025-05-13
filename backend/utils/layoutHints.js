const layoutHints = {
  "HIPAA": {
    groupPatientInfoRow: true,
    includeDate: true,
    staticText: true,
    staticTextPosition: "bottom"
  },
  "Excuse Letter": {
    groupPatientInfoRow: false,
    includeDate: true,
    staticText: true,
    staticTextPosition: "bottom"
  },
   "Medical History": {
    groupPatientInfoRow: true,
     includeDate: true,
    staticText: true,
    sections: [
      {
        title: "Emergency Contacts",
        fields: [
          "MedicalDoctor",
          "CityState",
          "ICEContact",
          "ICEPhone",
          "Relationship"
        ]
      },
      {
        title: "Medications",
        note: "**EXISTING PATIENTS** Check the box next to any medication no longer being taken.",
        fields: [
          "inputMed1", "inputMed2", "inputMed3", "inputMed4", "inputMed5",
          "inputMed6", "inputMed7", "inputMed8", "inputMed9", "inputMed10"
        ]
      },
      {
        title: "Allergies",
        note: "Are you allergic to any of the following?",
        fields: [
          "Allergy_Anesthetic", "Allergy_Aspirin", "Allergy_Codeine", "Allergy_Ibuprofen",
          "Allergy_Iodine", "Allergy_Latex", "Allergy_Penicillin", "Allergy_Sulfa",
          "Allergy_Other"
        ]
      },
      {
        title: "Medical Conditions",
        note: "Do you have any of the following medical conditions?",
        fields: [
          "Asthma", "BleedingProblems", "Cancer", "Diabetes", "HeartMurmur",
          "HeartTrouble", "HighBloodPressure", "JointReplacement",
          "KidneyDisease", "LiverDisease", "Pregnancy", "PsychiatricTreatment",
          "RheumaticFever", "SinusTrouble", "Stroke", "Ulcers",
          "MedicalCondition_Other"
        ]
      },
      {
        title: "Today’s Visit",
        fields: [
          "TobaccoUse", "InjectionReactions", "ReasonForVisit", "AreYouInPain"
        ]
      },
      {
        title: "New Patients",
        note: "New Patients:",
        fields: [
          "PanoramicXRays", "BiteWingXRays", "FormerDentist",
          "FormerDentistCityState", "DateOfLastCleaning"
        ]
      },
      {
        title: "Signature",
        fields: ["signature"]
      }
    ]
  },
  "Registration/HIPAA Form2": {
    groupPatientInfoRow: true,
    includeDate: true,
    staticText: true,
    staticTextPosition: "bottom",
    sections: [
      {
        title: "Patient Information",
        fields: ["LName", "FName", "MiddleI", "Preferred", "Birthdate", "SSN", "Gender", "Position"]
      },
      {
        title: "Contact Details",
        fields: ["WkPhone", "WirelessPhone", "HmPhone", "Email"]
      },
      {
        title: "Preferences",
        fields: [
          "PreferContactMethod", "PreferConfirmMethod", "PreferRecallMethod",
          "StudentStatus", "referredFrom"
        ]
      },
      {
        title: "Address and Home Phone",
        fields: ["Address", "Address2", "City", "State", "Zip"]
      },
      {
        title: "Insurance Policy 1",
        fields: [
          "ins1Relat", "ins1SubscriberNameF", "ins1SubscriberID", "ins1CarrierName", "ins1CarrierPhone",
          "ins1EmployerName", "ins1GroupName", "ins1GroupNum"
        ]
      },
      {
        title: "Insurance Policy 2",
        fields: [
          "ins2Relat", "ins2SubscriberNameF", "ins2SubscriberID", "ins2CarrierName", "ins2CarrierPhone",
          "ins2EmployerName", "ins2GroupName", "ins2GroupNum"
        ]
      },
      {
        title: "Other Authorized Party",
        fields: ["misc"]
      },
      {
        title: "Signature",
        fields: ["signature"]
      }
    ]
  },

  "Dental Insurance Secural/IAO": {
  staticText: true,
  staticTextPosition: "top",
  sections: [
    {
      title: "Insurance & Personal Info",
      fields: [
        "dateToday", "FName", "LName", "Birthdate", "toothNum"
      ]
    },
    {
      title: "Credit Card Info",
      fields: [
        "CreditCardNumber", "ExpDate", "CVV",
        "BillingAddress", "City", "State", "ZipCode"
      ]
    },
    {
      title: "Signature",
      fields: ["signature"]
    }
  ]
}

};

module.exports = layoutHints;

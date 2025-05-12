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
    staticText: false,
    staticTextPosition: null
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
  }
};

module.exports = layoutHints;

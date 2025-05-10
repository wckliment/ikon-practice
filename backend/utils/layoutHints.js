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
}
};

module.exports = layoutHints;

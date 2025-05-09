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
  }
};

module.exports = layoutHints;

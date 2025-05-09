const formToDocCategoryMap = {
  "Medical History": 130,       // Medical History
  "Extraction Consent": 135,    // Letters
  "Excuse Letter": 135,         // Letters
  "Credit Approval": 136,       // Credit Approval
  "Financial": 134,             // Financial
  "Insurance": 131,             // Insurance
  "Miscellaneous": 137,         // Miscellaneous
  "Patient Information": 138,   // Patient Information
  "Treatment Plans": 132,       // Treatment Plans
  "Patient Treatment": 133,     // Patient Treatment
  "BWs": 179,                   // BWs
  "FMXs": 180,                  // FMXs
  "Panos": 181,                 // Panos
  "Photos": 182,                // Photos
  "Patient Pictures": 190,      // Patient Pictures
  "Statements": 240,            // Statements
  "Tooth Charts": 251,          // Tooth Charts
  "Lab Slips": 304,             // Lab Slips
  "Payment Plans": 305,         // Payment Plans
  "Claim Attachments": 316,     // Claim Attachments
  "eClipboard": 322             // eClipboard
};

function getDocCategory(formTitle) {
  return formToDocCategoryMap[formTitle] || 130; // Fallback to Medical History
}

module.exports = { getDocCategory };

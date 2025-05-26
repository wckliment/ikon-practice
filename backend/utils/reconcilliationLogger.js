const db = require("../config/db");

exports.logReconciliationIfNeeded = async (
  patientId,
  fieldName,
  submittedValue,
  originalValue,
  formName,
  fieldType // ✅ new parameter
) => {
  if (!submittedValue || submittedValue === originalValue) return;

  // ✅ Skip if it's a field type we don't care about
  if (["signature", "static_text"].includes(fieldType)) return;

  try {
    await db.query(
      `INSERT INTO reconciled_form_data (patient_id, field_name, submitted_value, original_value, form_name)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, fieldName, submittedValue, originalValue || null, formName]
    );
    console.log(`🔍 Reconciliation logged for ${fieldName}: '${originalValue}' → '${submittedValue}'`);
  } catch (err) {
    console.error("❌ Failed to insert reconciliation entry:", err);
  }
};

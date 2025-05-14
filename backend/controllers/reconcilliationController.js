const db = require('../config/db');

exports.createEntry = async (req, res) => {
  const { patientId, fieldName, submittedValue, originalValue, formName } = req.body;

  try {
    await db.query(`
      INSERT INTO reconciled_form_data (patient_id, field_name, submitted_value, original_value, form_name)
      VALUES (?, ?, ?, ?, ?)
    `, [patientId, fieldName, submittedValue, originalValue || null, formName]);

    res.status(201).json({ success: true, message: 'Reconciliation entry created.' });
  } catch (err) {
    console.error('Error creating reconciliation entry:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPendingByPatient = async (req, res) => {
  const { patNum } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id, field_name, submitted_value, original_value, form_name, created_at
       FROM reconciled_form_data
       WHERE patient_id = ? AND is_resolved = false
       ORDER BY created_at DESC`,
      [patNum]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching reconciliation rows:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

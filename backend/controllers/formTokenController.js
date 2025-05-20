const crypto = require("crypto");
const db = require("../config/db");

// ✅ 1. Generate a form token
exports.generateCustomFormToken = async (req, res) => {
  try {
    const { form_id, patient_id } = req.body;

    if (!form_id) {
      return res.status(400).json({ error: "form_id is required" });
    }

    const token = crypto.randomUUID();
    const issued_at = new Date();

    await db.query(
      `INSERT INTO custom_form_tokens (token, form_id, patient_id, issued_at)
       VALUES (?, ?, ?, ?)`,
      [token, form_id, patient_id || null, issued_at]
    );

    const origin = req.headers.origin || process.env.APP_BASE_URL || "http://localhost:5173";
    const fullLink = `${origin}/forms/custom/${token}`;

    res.json({ token, link: fullLink });
  } catch (err) {
    console.error("❌ Error generating custom form token:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ 2. Fetch the form via token (now using Open Dental)
exports.getCustomFormByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const [[row]] = await db.query(
      `SELECT t.*, f.name AS form_name, f.description
       FROM custom_form_tokens t
       JOIN custom_forms f ON t.form_id = f.id
       WHERE t.token = ?`,
      [token]
    );

    if (!row) {
      return res.status(404).json({ error: "Invalid or expired form token." });
    }

    const [fields] = await db.query(
      `SELECT * FROM custom_form_fields WHERE form_id = ? ORDER BY field_order ASC`,
      [row.form_id]
    );

    const parsedFields = fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
    }));

    // ✅ Use Open Dental API to get patient data
    let patient = null;
    if (row.patient_id && req.openDentalService) {
      try {
        patient = await req.openDentalService.getPatient(row.patient_id);
      } catch (err) {
        console.warn("⚠️ Failed to fetch patient from Open Dental:", err.message);
      }
    }

    res.json({
      form: {
        id: row.form_id,
        name: row.form_name,
        description: row.description,
      },
      fields: parsedFields,
      patient,
    });
  } catch (err) {
    console.error("❌ Error in getCustomFormByToken:", err);
    res.status(500).json({ error: "Failed to load form by token." });
  }
};

exports.getTokensByPatient = async (req, res) => {
  const { patNum } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
         t.token,
         t.issued_at,
         f.name AS form_name,
         t.method,
         t.id
       FROM custom_form_tokens t
       JOIN custom_forms f ON t.form_id = f.id
       WHERE t.patient_id = ?
         AND NOT EXISTS (
           SELECT 1 FROM custom_form_submissions s
           WHERE s.form_id = t.form_id AND s.patient_id = t.patient_id
         )
       ORDER BY t.issued_at DESC`,
      [patNum]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching tokens for patient:", err);
    res.status(500).json({ error: "Failed to fetch form tokens." });
  }
};


exports.deleteTokenById = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM custom_form_tokens WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Token not found." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting token:", err);
    res.status(500).json({ error: "Failed to delete token." });
  }
};

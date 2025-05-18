const crypto = require("crypto");
const db = require("../config/db");


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

    res.json({
      form: {
        id: row.form_id,
        name: row.form_name,
        description: row.description,
        patient_id: row.patient_id || null,
      },
      fields: parsedFields,
    });
  } catch (err) {
    console.error("❌ Error in getCustomFormByToken:", err);
    res.status(500).json({ error: "Failed to load form by token." });
  }
};


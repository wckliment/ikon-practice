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
    const location_id = req.user?.location_id;

    await db.query(
      `INSERT INTO custom_form_tokens (token, form_id, patient_id, location_id, issued_at)
       VALUES (?, ?, ?, ?, ?)`,
      [token, form_id, patient_id || null, location_id, issued_at]
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

    console.log("🔍 Lookup result for token", token, "=>", row);

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
console.log("🔍 Loaded token row:", row);

if (row.patient_id && req.openDentalService) {
  console.log("🔍 Attempting to fetch patient from Open Dental using ID:", row.patient_id);

  try {
    patient = await req.openDentalService.getPatient(row.patient_id);
    console.log("✅ Patient fetched from Open Dental:", patient);
  } catch (err) {
    console.warn("⚠️ Failed to fetch patient from Open Dental:", err.message);
  }
} else {
  console.warn("⚠️ No patient_id or req.openDentalService present");
}

    res.json({
      form: {
        id: row.form_id,
        name: row.form_name,
        description: row.description,
      },
      fields: parsedFields,
      patient,
      method: row.method,
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

exports.sendTabletFormToken = async (req, res, io) => {
  try {
    const { form_id, patient_id } = req.body;
    const location_id = req.user?.location_id;

    if (!form_id || !patient_id || !location_id) {
      return res.status(400).json({ error: "Missing form_id, patient_id, or location_id" });
    }

    const token = require("crypto").randomUUID();
    const issued_at = new Date();

    await db.query(
      `INSERT INTO custom_form_tokens (token, form_id, patient_id, location_id, issued_at, method)
       VALUES (?, ?, ?, ?, ?, 'tablet')`,
      [token, form_id, patient_id, location_id, issued_at]
    );

    // Fetch names for socket payload
  let patientName = "Unknown Patient";
try {
  const patient = await req.openDentalService.getPatient(patient_id);
  patientName = `${patient.FName || ""} ${patient.LName || ""}`.trim();
} catch (err) {
  console.warn("⚠️ Failed to fetch patient from Open Dental:", err.message);
}

    const [[formRow]] = await db.query(
      `SELECT name, description FROM custom_forms WHERE id = ?`,
      [form_id]
    );

    const payload = {
  token,
  formName: formRow?.name || "Form",
  description: formRow?.description || null,
  patientName,
  issuedAt: issued_at.toISOString(),
};

    const room = `location-${location_id}`;
    console.log("📡 Emitting tablet-form to", room, "with payload:", payload);
    io.to(room).emit("tablet-form", payload);

    res.json({ token, message: "Form sent to tablet" });
  } catch (err) {
    console.error("❌ Error sending tablet form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

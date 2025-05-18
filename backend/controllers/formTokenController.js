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

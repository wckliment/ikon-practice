const OpenDentalService = require("../services/openDentalService");
const { getKeysFromLocation } = require("../utils/locationUtils");
const db = require("../config/db");

const ensureOpenDentalByToken = async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({ error: "Missing form token." });
  }

  try {
    // Get form token metadata
    const [[row]] = await db.query(
      `SELECT t.patient_id, l.code AS location_code
       FROM custom_form_tokens t
       LEFT JOIN locations l ON l.id = (
         SELECT location_id FROM users WHERE id = (
           SELECT created_by FROM custom_forms WHERE id = t.form_id
         )
       )
       WHERE t.token = ?`,
      [token]
    );

    if (!row || !row.location_code) {
      return res.status(400).json({ error: "Unable to resolve location from token." });
    }

    const { devKey, custKey } = await getKeysFromLocation(row.location_code);

    req.openDentalService = new OpenDentalService(devKey, custKey);
    next();
  } catch (err) {
    console.error("❌ Failed to attach OpenDentalService by token:", err);
    res.status(500).json({ error: "Failed to connect to Open Dental." });
  }
};

module.exports = ensureOpenDentalByToken;

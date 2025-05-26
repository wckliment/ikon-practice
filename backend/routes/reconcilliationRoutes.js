
const express = require("express");
const router = express.Router();
const reconcilliationController = require("../controllers/reconcilliationController");
const authenticateUser = require("../middleware/authMiddleware");
const ensureOpenDental = require("../middleware/ensureOpenDental");
const db = require("../config/db");


// 🔒 JWT protection
router.use(authenticateUser);

// 🏥 Inject OpenDentalService based on user location
router.use(ensureOpenDental);

// Routes
router.post("/", reconcilliationController.createEntry);
router.get("/:patNum", reconcilliationController.getPendingByPatient);


const fieldNameToOpenDentalKey = (label) => {
  const key = label.toLowerCase();
  if (key.includes("first name")) return "FName";
  if (key.includes("last name")) return "LName";
  if (key.includes("email")) return "Email";
  if (key.includes("phone")) return "WirelessPhone";
  if (key.includes("birthdate")) return "Birthdate";
  return null;
};


router.patch("/:id/resolve", async (req, res) => {
  const reconciliationId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT * FROM reconciled_form_data WHERE id = ? AND is_resolved = false LIMIT 1`,
      [reconciliationId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Reconciliation entry not found or already resolved." });
    }

    const entry = rows[0];
    const { patient_id, field_name, submitted_value } = entry;

    const openDentalKey = fieldNameToOpenDentalKey(field_name);
    if (!openDentalKey) {
      return res.status(400).json({ error: `Unsupported field: ${field_name}` });
    }

    const payload = { [openDentalKey]: submitted_value };
    const response = await req.openDentalService.updatePatient(patient_id, payload);

    await db.query(
      `UPDATE reconciled_form_data SET is_resolved = true, resolved_at = NOW() WHERE id = ?`,
      [reconciliationId]
    );

    res.status(200).json({
      success: true,
      updatedField: openDentalKey,
      newValue: submitted_value,
      openDentalResponse: response,
    });
  } catch (err) {
    console.error("❌ Failed to resolve reconciliation entry:", err.message);
    res.status(500).json({ error: err.message });
  }
});



router.patch("/:id/reject", async (req, res) => {
  const reconciliationId = req.params.id;

  try {
    await db.query(
      `UPDATE reconciled_form_data
       SET is_resolved = true, rejected = true, resolved_at = NOW(), resolved_by = ?
       WHERE id = ?`,
      [req.user.id, reconciliationId]
    );

    res.status(200).json({ success: true, message: "Entry rejected." });
  } catch (err) {
    console.error("❌ Failed to reject reconciliation entry:", err.message);
    res.status(500).json({ error: err.message });
  }
});





module.exports = router;

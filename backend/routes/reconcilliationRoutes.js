const express = require("express");
const router = express.Router();
const reconcilliationController = require("../controllers/reconcilliationController");
const authenticateUser = require("../middleware/authMiddleware");
const ensureOpenDental = require("../middleware/ensureOpenDental"); // ✅ import it

// 🔒 JWT protection
router.use(authenticateUser);

// 🏥 Inject OpenDentalService based on user location
router.use(ensureOpenDental);

// Routes
router.post("/", reconcilliationController.createEntry);
router.get("/:patNum", reconcilliationController.getPendingByPatient);

// 🧪 TEMP: Test PATCH route (only for Postman)
router.patch("/resolve-test/:patNum", async (req, res) => {
  try {
    const patNum = req.params.patNum;
    const { field_name, new_value } = req.body;

    const payload = { [field_name]: new_value };
    const response = await req.openDentalService.updatePatient(patNum, payload);

    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("❌ Test patch failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

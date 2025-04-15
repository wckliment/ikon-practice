const express = require("express");
const tabletController = require("../controllers/tabletController");
const authenticateUser = require("../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  // Public: Tablet Login Route
  router.post("/login", tabletController.tabletLogin);

  // 🔐 Protected: Patient lookup & check-in
  router.post("/patient-lookup", authenticateUser, tabletController.patientLookup);

  // 👇 Inject `io` into check-in controller
  router.post("/tablet-checkin", authenticateUser, (req, res) =>
    tabletController.sendTabletCheckInMessage(req, res, io)
  );

  return router;
};

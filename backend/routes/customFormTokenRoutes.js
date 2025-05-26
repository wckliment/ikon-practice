module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const {
    generateCustomFormToken,
    getCustomFormByToken,
    getTokensByPatient,
    deleteTokenById,
    sendTabletFormToken
  } = require("../controllers/formTokenController");

  const authenticateUser = require("../middleware/authMiddleware");
  const ensureOpenDental = require("../middleware/ensureOpenDental");
  const ensureOpenDentalByToken = require("../middleware/ensureOpenDentalByToken");

  // Public
  router.get("/:token", ensureOpenDentalByToken, getCustomFormByToken);
  router.post("/public-generate", generateCustomFormToken);

  // Authenticated
  router.post("/generate", authenticateUser, generateCustomFormToken);
  router.get("/patient/:patNum", authenticateUser, getTokensByPatient);
  router.delete("/:id", authenticateUser, deleteTokenById);

  // ✅ Tablet route with io and OpenDental service
  router.post("/tablet", authenticateUser, ensureOpenDental, (req, res) => {
    console.log("📥 Tablet POST hit");
    sendTabletFormToken(req, res, io);
  });

  return router;
};

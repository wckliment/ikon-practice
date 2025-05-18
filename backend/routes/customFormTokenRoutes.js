const express = require("express");
const router = express.Router();
const { generateCustomFormToken } = require("../controllers/formTokenController");

router.post("/generate", generateCustomFormToken);

module.exports = router;

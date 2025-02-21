const express = require("express");
const router = express.Router();

// GET /test
router.get("/", (req, res) => {
  res.json({ message: "Hello from the test route!" });
});

module.exports = router;

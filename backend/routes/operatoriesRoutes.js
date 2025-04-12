const express = require("express");
const router = express.Router();
const { getOperatories } = require("../controllers/operatoriesController");

router.get("/", getOperatories);

module.exports = router;

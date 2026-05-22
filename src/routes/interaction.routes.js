const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/interaction.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/:email", verifyToken, ctrl.listForUser);

module.exports = router;

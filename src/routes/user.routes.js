const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");

router.patch("/:email", verifyToken, ctrl.updateProfile);

module.exports = router;

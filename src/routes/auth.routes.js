const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/google", ctrl.google);
router.post("/logout", ctrl.logout);
router.get("/me", verifyToken, ctrl.me);

module.exports = router;

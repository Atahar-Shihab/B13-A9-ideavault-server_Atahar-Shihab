const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bookmark.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, ctrl.add);
router.delete("/:ideaId", verifyToken, ctrl.remove);

// IMPORTANT: /check/:email must come BEFORE /:email
router.get("/check/:email", verifyToken, ctrl.check);
router.get("/:email", verifyToken, ctrl.listForUser);

module.exports = router;

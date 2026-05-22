const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/comment.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, ctrl.create);
router.get("/:ideaId", ctrl.listForIdea);
router.put("/:id", verifyToken, ctrl.update);
router.delete("/:id", verifyToken, ctrl.remove);

module.exports = router;

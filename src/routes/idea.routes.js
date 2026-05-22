const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/idea.controller");
const verifyToken = require("../middleware/verifyToken");

// IMPORTANT: specific routes (/trending, /my/:email) must come BEFORE /:id
router.get("/trending", ctrl.trending);
router.get("/my/:email", verifyToken, ctrl.myIdeas);

router.get("/", ctrl.list);
router.post("/", verifyToken, ctrl.create);

router.get("/:id", verifyToken, ctrl.getOne);
router.put("/:id", verifyToken, ctrl.update);
router.delete("/:id", verifyToken, ctrl.remove);
router.post("/:id/like", verifyToken, ctrl.toggleLike);

module.exports = router;

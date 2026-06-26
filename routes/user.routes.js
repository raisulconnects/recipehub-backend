const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getAll,
  toggleBlock,
  updateProfile,
  getStats,
} = require("../controllers/user.controller");

const router = Router();

router.get("/", verifyToken, verifyAdmin, getAll);
router.get("/stats", resolveUser, getStats);
router.patch("/:id/block", verifyToken, verifyAdmin, toggleBlock);
router.patch("/profile", verifyToken, resolveUser, updateProfile);

module.exports = router;

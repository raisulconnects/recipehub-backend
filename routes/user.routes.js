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

router.get("/", resolveUser, verifyAdmin, getAll);
router.get("/stats", resolveUser, getStats);
router.patch("/:id/block", verifyToken, resolveUser, verifyAdmin, toggleBlock);
router.patch("/profile", verifyToken, resolveUser, updateProfile);

module.exports = router;

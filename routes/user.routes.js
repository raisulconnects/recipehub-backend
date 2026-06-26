const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const {
  getAll,
  toggleBlock,
  updateProfile,
  getStats,
} = require("../controllers/user.controller");

const router = Router();

router.get("/", getAll);
router.get("/stats", resolveUser, getStats);
router.patch("/:id/block", toggleBlock);
router.patch("/profile", verifyToken, resolveUser, updateProfile);

module.exports = router;

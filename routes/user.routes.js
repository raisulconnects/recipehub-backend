const { Router } = require("express");
const {
  getAll,
  toggleBlock,
  updateProfile,
} = require("../controllers/user.controller");

const router = Router();

router.get("/", getAll);
router.patch("/:id/block", toggleBlock);
router.patch("/profile", updateProfile);

module.exports = router;

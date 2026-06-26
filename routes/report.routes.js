const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  create,
  getAll,
  dismiss,
  removeRecipe,
} = require("../controllers/report.controller");

const router = Router();

router.post("/", verifyToken, resolveUser, create);
router.get("/", verifyToken, verifyAdmin, getAll);
router.patch("/:id/dismiss", verifyToken, verifyAdmin, dismiss);
router.delete("/:id/remove-recipe", verifyToken, verifyAdmin, removeRecipe);

module.exports = router;

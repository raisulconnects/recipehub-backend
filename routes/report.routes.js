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
router.get("/", resolveUser, verifyAdmin, getAll);
router.patch("/:id/dismiss", verifyToken, resolveUser, verifyAdmin, dismiss);
router.delete("/:id/remove-recipe", verifyToken, resolveUser, verifyAdmin, removeRecipe);

module.exports = router;

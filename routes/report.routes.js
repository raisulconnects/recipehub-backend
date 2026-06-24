const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const {
  create,
  getAll,
  dismiss,
  removeRecipe,
} = require("../controllers/report.controller");

const router = Router();

router.post("/", resolveUser, create);
router.get("/", getAll);
router.patch("/:id/dismiss", dismiss);
router.delete("/:id/remove-recipe", removeRecipe);

module.exports = router;

const { Router } = require("express");
const {
  create,
  getAll,
  dismiss,
  removeRecipe,
} = require("../controllers/report.controller");

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.patch("/:id/dismiss", dismiss);
router.delete("/:id/remove-recipe", removeRecipe);

module.exports = router;

const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleLike,
  toggleFeature,
  getFeatured,
  getPopular,
} = require("../controllers/recipe.controller");

const router = Router();

router.get("/", getAll);
router.get("/featured", getFeatured);
router.get("/popular", getPopular);
router.get("/:id", getById);
router.post("/", resolveUser, create);
router.patch("/:id", resolveUser, update);
router.delete("/:id", resolveUser, remove);
router.patch("/:id/like", resolveUser, toggleLike);
router.patch("/:id/feature", toggleFeature);

module.exports = router;

const { Router } = require("express");
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
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/like", toggleLike);
router.patch("/:id/feature", toggleFeature);

module.exports = router;

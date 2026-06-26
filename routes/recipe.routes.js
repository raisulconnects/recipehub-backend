const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
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
router.post("/", verifyToken, resolveUser, create);
router.patch("/:id", verifyToken, resolveUser, update);
router.delete("/:id", verifyToken, resolveUser, remove);
router.patch("/:id/like", verifyToken, resolveUser, toggleLike);
router.patch("/:id/feature", verifyToken, verifyAdmin, toggleFeature);

module.exports = router;

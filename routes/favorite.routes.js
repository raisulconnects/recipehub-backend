const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const {
  getAll,
  add,
  remove,
} = require("../controllers/favorite.controller");

const router = Router();

router.get("/", resolveUser, getAll);
router.post("/", resolveUser, add);
router.delete("/:recipeId", resolveUser, remove);

module.exports = router;

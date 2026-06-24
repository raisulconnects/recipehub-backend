const { Router } = require("express");
const {
  getAll,
  add,
  remove,
} = require("../controllers/favorite.controller");

const router = Router();

router.get("/", getAll);
router.post("/", add);
router.delete("/:recipeId", remove);

module.exports = router;

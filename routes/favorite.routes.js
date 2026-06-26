const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const { getAll, add, remove } = require("../controllers/favorite.controller");

const router = Router();

router.get("/", resolveUser, getAll);
router.post("/", verifyToken, resolveUser, add);
router.delete("/:recipeId", verifyToken, resolveUser, remove);

module.exports = router;

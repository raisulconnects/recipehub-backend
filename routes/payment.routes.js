const { Router } = require("express");
const resolveUser = require("../middleware/resolveUser");
const verifyToken = require("../middleware/verifyToken");
const {
  createCheckoutSession,
  verify,
  getPurchased,
  getTransactions,
} = require("../controllers/payment.controller");

const router = Router();

router.post("/create-checkout-session", verifyToken, resolveUser, createCheckoutSession);
router.get("/verify", resolveUser, verify);
router.get("/purchased", resolveUser, getPurchased);
router.get("/transactions", getTransactions);

module.exports = router;

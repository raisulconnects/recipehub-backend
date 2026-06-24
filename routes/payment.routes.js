const { Router } = require("express");
const {
  createCheckoutSession,
  verify,
  getPurchased,
  getTransactions,
} = require("../controllers/payment.controller");

const router = Router();

router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify", verify);
router.get("/purchased", getPurchased);
router.get("/transactions", getTransactions);

module.exports = router;

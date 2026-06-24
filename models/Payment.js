const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userEmail: String,
  userId: String,
  amount: Number,
  type: { type: String, enum: ["recipe", "premium"] },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    default: null,
  },
  transactionId: String,
  paymentStatus: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
  paidAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);

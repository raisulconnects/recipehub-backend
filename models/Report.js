const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
  reporterEmail: String,
  reason: {
    type: String,
    enum: ["Spam", "Offensive Content", "Copyright Issue"],
  },
  status: { type: String, enum: ["pending", "dismissed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);

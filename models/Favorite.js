const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userEmail: String,
  userId: String,
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Favorite", favoriteSchema);

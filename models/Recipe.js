const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    recipeName: { type: String, required: true },
    recipeImage: String,
    category: String,
    cuisineType: String,
    difficultyLevel: { type: String, enum: ["Easy", "Medium", "Hard"] },
    preparationTime: Number,
    ingredients: [String],
    instructions: String,
    authorId: String,
    authorName: String,
    authorEmail: String,
    likesCount: { type: Number, default: 0 },
    likedBy: [String],
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "deleted"], default: "active" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recipe", recipeSchema);

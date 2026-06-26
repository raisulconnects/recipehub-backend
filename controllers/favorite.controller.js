const Favorite = require("../models/Favorite");

exports.getAll = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const favorites = await Favorite.find({
      userEmail: req.user.email,
    }).populate("recipeId");
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.add = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const { recipeId } = req.body;
    const existing = await Favorite.findOne({
      userEmail: req.user.email,
      recipeId,
    });
    if (existing)
      return res.status(400).json({ message: "Recipe already in favorites" });

    const favorite = await Favorite.create({
      userEmail: req.user.email,
      userId: req.user.id,
      recipeId,
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const result = await Favorite.findOneAndDelete({
      userEmail: req.user.email,
      recipeId: req.params.recipeId,
    });
    if (!result) return res.status(404).json({ message: "Favorite not found" });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

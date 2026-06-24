const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");

exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, image } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(image && { image }) },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const email = req.user.email;

    const totalRecipes = await Recipe.countDocuments({ authorEmail: email, status: "active" });
    const totalFavorites = await Favorite.countDocuments({ userEmail: email });

    const recipes = await Recipe.find({ authorEmail: email, status: "active" }).select("likesCount");
    const totalLikesReceived = recipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);

    res.json({ totalRecipes, totalFavorites, totalLikesReceived });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Recipe = require("../models/Recipe");

exports.getAll = async (req, res) => {
  try {
    const { categories, authorEmail, showAll, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (!showAll) filter.status = "active";
    if (categories) filter.category = { $in: categories.split(",") };
    if (authorEmail) filter.authorEmail = authorEmail;
    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { recipeName: regex },
        { cuisineType: regex },
        { category: regex },
      ];
    }

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      data: recipes,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isFeatured: true, status: "active" }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopular = async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: "active" }).sort({ likesCount: -1 }).limit(3);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || recipe.status === "deleted")
      return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const recipeCount = await Recipe.countDocuments({ authorEmail: req.user.email });
    if (recipeCount >= 2 && !req.user.isPremium)
      return res.status(403).json({ message: "Upgrade to premium to add more recipes" });

    const recipe = await Recipe.create({ ...req.body });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.authorEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized to update this recipe" });

    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.authorEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized to delete this recipe" });

    recipe.status = "deleted";
    await recipe.save();
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || recipe.status === "deleted")
      return res.status(404).json({ message: "Recipe not found" });

    const alreadyLiked = recipe.likedBy.includes(req.user.email);
    if (alreadyLiked) {
      recipe.likedBy.pull(req.user.email);
      recipe.likesCount -= 1;
    } else {
      recipe.likedBy.push(req.user.email);
      recipe.likesCount += 1;
    }
    await recipe.save();

    res.json({ liked: !alreadyLiked, likesCount: recipe.likesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFeature = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.isFeatured = !recipe.isFeatured;
    await recipe.save();
    res.json({ isFeatured: recipe.isFeatured });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

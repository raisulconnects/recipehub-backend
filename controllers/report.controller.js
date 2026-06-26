const Report = require("../models/Report");
const Recipe = require("../models/Recipe");

exports.create = async (req, res) => {
  try {
    const { recipeId, reason, note } = req.body;
    if (!recipeId || !reason)
      return res
        .status(400)
        .json({ message: "Recipe ID and reason are required" });

    const report = await Report.create({
      recipeId,
      reporterEmail: req.user.email,
      reason,
      note: (note || "").slice(0, 200),
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("recipeId")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dismiss = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "dismissed" },
      { new: true },
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeRecipe = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    await Recipe.findByIdAndDelete(report.recipeId);
    report.status = "dismissed";
    await report.save();

    res.json({ message: "Recipe removed and report dismissed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

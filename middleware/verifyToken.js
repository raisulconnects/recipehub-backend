const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(401).json({ message: "User not found" });
    if (user.isBlocked)
      return res.status(403).json({ message: "Account is blocked" });

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      image: user.image || "",
      role: user.role,
      isPremium: user.isPremium,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;

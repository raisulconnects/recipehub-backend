const mongoose = require("mongoose");

const COOKIE_NAME = "better-auth.session_token";

const resolveUser = async (req, res, next) => {
  try {
    let userId;

    const cookie = req.cookies?.[COOKIE_NAME];
    if (cookie) {
      const [token] = cookie.split(".");
      if (token) {
        const db = mongoose.connection.db;
        const session = await db.collection("session").findOne({ token });
        if (session && new Date(session.expiresAt) > new Date()) {
          userId = session.userId;
        }
      }
    }

    if (!userId && req.userId) {
      userId = req.userId;
    }

    if (!userId) return next();

    const db = mongoose.connection.db;
    const user = await db.collection("user").findOne({ _id: userId });
    if (!user || user.isBlocked) return next();

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      image: user.image || "",
      role: user.role || "user",
      isPremium: user.isPremium || false,
    };
  } catch {
    // Don't block requests if auth resolution fails
  }

  next();
};

module.exports = resolveUser;

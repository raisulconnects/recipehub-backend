const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    emailVerified: { type: Boolean, default: false },
    image: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "user" },
);

module.exports = mongoose.model("User", userSchema);

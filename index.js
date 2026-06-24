const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const recipeRoutes = require("./routes/recipe.routes");
const userRoutes = require("./routes/user.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const reportRoutes = require("./routes/report.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Recipe Hub API is up and running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Recipe Hub API is up and running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

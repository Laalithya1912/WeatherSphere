const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/weatherApp");

const User = mongoose.model("User", {
  email: String,
  password: String,
});

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash });

    res.json({ msg: "Signup successful" }); // ✅ important
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user._id }, "secret123");

    res.json({ msg: "Login successful", token });
  } catch {
    res.status(500).json({ msg: "Error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
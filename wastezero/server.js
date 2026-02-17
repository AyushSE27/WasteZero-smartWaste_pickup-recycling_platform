require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= MONGODB ================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

/* ================= USER MODEL ================= */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  location: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= OTP STORE ================= */
const otpStore = {};

/* ================= REGISTER ================= */
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });

    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* ================= LOGIN (SEND OTP) ================= */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    console.log("Generated OTP:", otp);

    await transporter.sendMail({
      from: `"WasteZero" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your WasteZero Login OTP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP ================= */
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record)
      return res.status(400).json({ message: "No OTP found" });

    if (Date.now() > record.expires)
      return res.status(400).json({ message: "OTP expired" });

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const user = await User.findOne({ email });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

/* ================= AUTH MIDDLEWARE ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

/* ================= GET PROFILE ================= */
app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* ================= UPDATE PROFILE ================= */
app.put("/api/profile", auth, async (req, res) => {
  try {
    const { name, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, location },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ================= CHANGE PASSWORD ================= */
app.put("/api/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

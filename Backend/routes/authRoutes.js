const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { logActivity } = require("../utils/activityLogger");
/*
----------------------------------
1️⃣ Register
----------------------------------
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      location,
      phone,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await logActivity({
      type: "user_registered",
      description: "New user registered",
      userId: user._id,
      userName: user.name,
      metadata: { role: user.role },
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
  console.log("REGISTER ERROR:", error);
  res.status(500).json({ message: error.message });
}

});

/*
----------------------------------
2️⃣ Login
----------------------------------
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.accountStatus === "blocked" || user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();


    await sendEmail(
      user.email,
      "Your WasteZero Login OTP",
      `Your OTP is: ${otp}`
    );

    res.json({ message: "OTP sent to your email" });

  } catch (error) {
  console.log("LOGIN ERROR FULL:", error);
  console.log("ERROR MESSAGE:", error.message);
  res.status(500).json({ message: "Server error" });
}
});

/*
----------------------------------
3️⃣ Verify OTP
----------------------------------
*/
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.accountStatus === "blocked" || user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      role: user.role,
      name: user.name,
      _id: user._id,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

const { protect } = require("../middleware/authMiddleware");

/*
====================================
GET Logged In User Profile
====================================
*/
router.get("/profile", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    role: req.user.role,
    location: req.user.location || "",
    skills: req.user.skills || [],
    bio: req.user.bio || "",
  });
});

/*
====================================
UPDATE Profile
====================================
*/
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedPhone =
      typeof req.body.phone === "string"
        ? req.body.phone.replace(/\D/g, "").slice(0, 12)
        : user.phone || "";

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = normalizedPhone;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      role: updatedUser.role,
      location: updatedUser.location,
      bio: updatedUser.bio,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
CHANGE PASSWORD
====================================
*/
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
----------------------------------
Forgot Password
----------------------------------
*/
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Create random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Your WasteZero Password",
      `Click this link to reset your password:\n\n${resetLink}`
    );

    res.json({ message: "Password reset link sent to your email" });

  } catch (error) {
    console.log("FORGOT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
----------------------------------
Reset Password
----------------------------------
*/
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

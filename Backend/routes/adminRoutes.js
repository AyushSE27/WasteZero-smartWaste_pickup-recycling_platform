const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

/*
===============================
GET All Users (Admin Only)
===============================
*/
router.get("/users", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
DELETE User
===============================
*/
router.delete("/users/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
Update Role
===============================
*/
router.put("/users/:id/role", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    user.role = req.body.role;
    await user.save();

    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
Block / Unblock User
===============================
*/
router.put("/users/:id/toggle-block", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: "User status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
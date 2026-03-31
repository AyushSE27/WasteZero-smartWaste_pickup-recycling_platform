const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

/* ✅ Get all users (LEFT PANEL) */
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id name username email",
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ✅ Get chat messages - populate sender so _id comes as string */
router.get("/:userId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort("createdAt")
      .lean(); // ✅ .lean() converts ObjectIds to plain strings

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/* ✅ Send message */
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "receiverId and content required" });
    }

    const msg = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // ✅ Return with sender as plain string using .lean()
    const saved = await Message.findById(msg._id).lean();
    res.json(saved);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
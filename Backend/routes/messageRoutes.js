const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

/* SEND MESSAGE */
router.post("/", protect, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET CONVERSATION */
router.get("/:userId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

/* GET USER NOTIFICATIONS */
router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({
    user_id: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

/* MARK AS READ */
router.put("/:id/read", protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: "Not found" });
  }

  notification.read = true;
  await notification.save();

  res.json(notification);
});

module.exports = router;
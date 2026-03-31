const express = require("express");
const router = express.Router();
const Pickup = require("../models/Pickup");
const { protect } = require("../middleware/authMiddleware");

/*
================================
CREATE PICKUP
================================
*/
router.post("/", protect, async (req, res) => {
  try {
    const { address, city, date, timeSlot, wasteTypes, notes } = req.body;

    // Generate sequential pickup number
const count = await Pickup.countDocuments();
const year = new Date().getFullYear();
const pickupNumber = String(count + 1).padStart(4, "0");

const newPickupId = `WZP-${year}-${pickupNumber}`;

const pickup = await Pickup.create({
  pickupId: newPickupId,
  user_id: req.user._id,
  address,
  city,
  date,
  timeSlot,
  wasteTypes,
  notes,
});

    res.status(201).json(pickup);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
================================
GET MY PICKUPS
================================
*/
router.get("/my", protect, async (req, res) => {
  try {
    const pickups = await Pickup.find({
      user_id: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
================================
DELETE PICKUP
================================
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    if (pickup.user_id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await pickup.deleteOne();

    res.json({ message: "Pickup deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
================================
UPDATE PICKUP STATUS (NGO / ADMIN)
================================
*/
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    pickup.status = status;
    await pickup.save();

    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
================================
GET ALL PICKUPS (ADMIN)
================================
*/
router.get("/admin/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pickups = await Pickup.find()
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });

    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

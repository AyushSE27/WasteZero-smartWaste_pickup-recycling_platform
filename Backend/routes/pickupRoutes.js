const express = require("express");
const router = express.Router();
const Pickup = require("../models/Pickup");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");
const { logActivity } = require("../utils/activityLogger");
const { getNotificationPreferences } = require("../utils/notificationPreferences");

const createNotificationEntry = async ({
  user,
  type,
  message,
  requestId,
  metadata,
}) => {
  try {
    await Notification.create({
      user_id: user._id,
      message,
    });

    await logActivity({
      type,
      description: message,
      userId: user._id,
      userName: user.name,
      requestId,
      metadata: {
        ...(metadata || {}),
        notification: true,
      },
    });
  } catch (_error) {
    // Notification failures must never block pickup flows
  }
};

/*
================================
CREATE PICKUP
================================
*/
router.post("/", protect, async (req, res) => {
  try {
    const { address, city, date, timeSlot, wasteTypes, notes } = req.body;
    const currentUser = await User.findById(req.user._id).select("name preferences notifications");

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

    await logActivity({
      type: "pickup_created",
      description: "New waste pickup request created",
      userId: req.user._id,
      userName: req.user.name,
      requestId: newPickupId,
      metadata: { city, wasteTypes },
    });

    const notificationPreferences = getNotificationPreferences(currentUser);
    if (notificationPreferences.reminders) {
      await createNotificationEntry({
        user: currentUser || req.user,
        type: "pickup_created",
        message: `Pickup request ${newPickupId} created successfully.`,
        requestId: newPickupId,
        metadata: { city, wasteTypes },
      });
    }

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

    const pickupUser = await User.findById(pickup.user_id).select(
      "name preferences notifications",
    );

    pickup.status = status;
    await pickup.save();

    const type =
      status === "completed"
        ? "pickup_completed"
        : status === "assigned"
          ? "pickup_assigned"
          : "pickup_status_updated";

    await logActivity({
      type,
      description:
        status === "completed"
          ? "Pickup completed"
          : status === "assigned"
            ? "Pickup assigned to an agent"
            : "Pickup status updated",
      userId: pickup.user_id,
      requestId: pickup.pickupId,
      metadata: { status, updatedByRole: req.user.role, updatedBy: req.user._id },
    });

    const notificationPreferences = getNotificationPreferences(pickupUser);
    if (notificationPreferences.pickupUpdates) {
      const notificationMessage =
        status === "completed"
          ? `Pickup ${pickup.pickupId} has been completed.`
          : status === "assigned"
            ? `Pickup ${pickup.pickupId} has been assigned.`
            : `Pickup ${pickup.pickupId} status updated to ${status}.`;

      await createNotificationEntry({
        user: pickupUser || { _id: pickup.user_id, name: "" },
        type,
        message: notificationMessage,
        requestId: pickup.pickupId,
        metadata: { status, updatedByRole: req.user.role, updatedBy: req.user._id },
      });
    }

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

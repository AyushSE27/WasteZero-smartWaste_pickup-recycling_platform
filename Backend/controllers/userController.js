const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Pickup = require("../models/Pickup");
const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { getNotificationPreferences } = require("../utils/notificationPreferences");

const getSettingsPayload = (user) => {
  const notificationPreferences = getNotificationPreferences(user);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    accountStatus: user.accountStatus || "active",
    avatar: user.avatar || "",
    defaultPickupLocation: user.defaultPickupLocation || user.location || "",
    preferences: {
      emailNotifications: notificationPreferences.email,
      pickupUpdates: notificationPreferences.pickupUpdates,
      reminderAlerts: notificationPreferences.reminders,
    },
  };
};

exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(getSettingsPayload(user));
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preferences = {
      ...user.preferences,
      emailNotifications:
        req.body.emailNotifications ?? user.preferences?.emailNotifications ?? true,
      pickupUpdates:
        req.body.pickupUpdates ?? user.preferences?.pickupUpdates ?? true,
      reminderAlerts:
        req.body.reminderAlerts ?? user.preferences?.reminderAlerts ?? true,
    };
    user.notifications = {
      ...user.notifications,
      email:
        req.body.emailNotifications ??
        req.body.email ??
        user.notifications?.email ??
        user.preferences?.emailNotifications ??
        true,
      pickupUpdates:
        req.body.pickupUpdates ??
        user.notifications?.pickupUpdates ??
        user.preferences?.pickupUpdates ??
        true,
      reminders:
        req.body.reminderAlerts ??
        req.body.reminders ??
        user.notifications?.reminders ??
        user.preferences?.reminderAlerts ??
        true,
    };

    await user.save();

    res.json({
      message: "Preferences updated successfully",
      preferences: getSettingsPayload(user).preferences,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
};

exports.updateLocationPreference = async (req, res) => {
  try {
    const { defaultPickupLocation } = req.body;

    if (!defaultPickupLocation || !defaultPickupLocation.trim()) {
      return res
        .status(400)
        .json({ message: "Default pickup location is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sanitizedLocation = defaultPickupLocation.trim();
    user.defaultPickupLocation = sanitizedLocation;
    user.location = sanitizedLocation;

    await user.save();

    res.json({
      message: "Default pickup location updated",
      defaultPickupLocation: sanitizedLocation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update location" });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    if (user.avatar) {
      const previousPath = path.join(process.cwd(), user.avatar.replace(/^\//, ""));
      if (fs.existsSync(previousPath)) {
        fs.unlinkSync(previousPath);
      }
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

exports.exportUserData = async (req, res) => {
  try {
    const pickups = await Pickup.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const exportRows = pickups.map((pickup) => ({
      pickupId: pickup.pickupId || pickup._id.toString(),
      address: pickup.address,
      city: pickup.city,
      date: pickup.date,
      timeSlot: pickup.timeSlot,
      wasteTypes: pickup.wasteTypes || [],
      status: pickup.status,
      notes: pickup.notes || "",
      createdAt: pickup.createdAt,
    }));

    res.json({
      message: "Pickup history loaded successfully",
      pickups: exportRows,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to export pickup history" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const opportunities = await Opportunity.find({ ngo_id: userId }).select("_id");
    const opportunityIds = opportunities.map((item) => item._id);

    if (opportunityIds.length) {
      await Application.deleteMany({ opportunity_id: { $in: opportunityIds } });
      await Opportunity.deleteMany({ _id: { $in: opportunityIds } });
    }

    await Pickup.deleteMany({ user_id: userId });
    await Pickup.updateMany(
      { assignedAgent: userId, status: "assigned" },
      { assignedAgent: null, status: "pending" },
    );
    await Pickup.updateMany(
      { assignedAgent: userId, status: { $ne: "assigned" } },
      { assignedAgent: null },
    );
    await Application.deleteMany({ volunteer_id: userId });
    await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }],
    });
    await Notification.deleteMany({ user_id: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};

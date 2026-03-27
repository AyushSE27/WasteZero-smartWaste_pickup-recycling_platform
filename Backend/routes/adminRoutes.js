const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Pickup = require("../models/Pickup");
const ActivityLog = require("../models/ActivityLog");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { logActivity } = require("../utils/activityLogger");

/*
===============================
GET All Users (Admin Only)
===============================
*/
router.get("/users", protect, requireAdmin, async (req, res) => {
  try {
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
router.delete("/users/:id", protect, requireAdmin, async (req, res) => {
  try {
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
router.put("/users/:id/role", protect, requireAdmin, async (req, res) => {
  try {
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
router.put("/users/:id/toggle-block", protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.isBlocked = !user.isBlocked;
    user.accountStatus = user.isBlocked ? "blocked" : "active";
    await user.save();

    res.json({ message: "User status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
GET Dashboard Stats (Admin)
GET /api/admin/dashboard-stats
===============================
*/
router.get("/dashboard-stats", protect, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalWastePickupRequests,
      pendingPickups,
      completedPickups,
      activePickupAgents,
    ] = await Promise.all([
      User.countDocuments(),
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: "pending" }),
      Pickup.countDocuments({ status: "completed" }),
      User.countDocuments({
        role: "volunteer",
        accountStatus: "active",
        isBlocked: { $ne: true },
      }),
    ]);

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [requestsOverTime, wasteTypeDistribution, pickupStatusDistribution] =
      await Promise.all([
        Pickup.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: "$_id", count: 1 } },
        ]),
        Pickup.aggregate([
          { $unwind: "$wasteTypes" },
          {
            $group: {
              _id: { $toLower: "$wasteTypes" },
              value: { $sum: 1 },
            },
          },
          { $sort: { value: -1 } },
          { $project: { _id: 0, type: "$_id", value: 1 } },
        ]),
        Pickup.aggregate([
          {
            $match: {
              status: { $in: ["pending", "assigned", "completed"] },
            },
          },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
      ]);

    res.json({
      totalUsers,
      totalWastePickupRequests,
      pendingPickups,
      completedPickups,
      activePickupAgents,
      analytics: {
        requestsOverTime,
        wasteTypeDistribution,
        pickupStatusDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
GET Activity Logs (Admin)
GET /api/admin/activity-logs?limit=10
===============================
*/
router.get("/activity-logs", protect, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 5000);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
GET Pickup Requests (Admin)
GET /api/admin/pickup-requests?q=&status=&sort=newest
===============================
*/
router.get("/pickup-requests", protect, requireAdmin, async (req, res) => {
  try {
    const { q = "", status = "all", sort = "newest" } = req.query;

    const pickupFilter = {};
    if (status !== "all") pickupFilter.status = status;

    let pickups = await Pickup.find(pickupFilter)
      .populate("user_id", "name email")
      .sort({ createdAt: sort === "oldest" ? 1 : -1 });

    const term = String(q || "").trim().toLowerCase();
    if (term) {
      pickups = pickups.filter((p) => {
        const requestId = String(p.pickupId || "").toLowerCase();
        const userName = String(p.user_id?.name || "").toLowerCase();
        return requestId.includes(term) || userName.includes(term);
      });
    }

    const rows = pickups.map((p) => ({
      _id: p._id,
      requestId: p.pickupId,
      userName: p.user_id?.name || "",
      wasteType: Array.isArray(p.wasteTypes) ? p.wasteTypes.join(", ") : "",
      pickupLocation: [p.address, p.city].filter(Boolean).join(", "),
      assignedAgent: p.assignedAgent || null,
      pickupStatus: p.status,
      createdAt: p.createdAt,
    }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
PUT Edit User Details (Admin)
PUT /api/admin/users/:id/edit
===============================
*/
router.put("/users/:id/edit", protect, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;

    await user.save();

    await logActivity({
      type: "user_edited",
      description: "User details updated",
      userId: user._id,
      userName: user.name,
      metadata: { editedBy: req.user._id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
PUT Suspend User (Admin) - toggles suspend/unsuspend
PUT /api/admin/users/:id/suspend
===============================
*/
router.put("/users/:id/suspend", protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const willSuspend = user.accountStatus !== "suspended";
    user.accountStatus = willSuspend ? "suspended" : "active";
    await user.save();

    await logActivity({
      type: willSuspend ? "user_suspended" : "user_unsuspended",
      description: willSuspend ? "User suspended" : "User suspension removed",
      userId: user._id,
      userName: user.name,
      metadata: { updatedBy: req.user._id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
PUT Block User (Admin) - toggles block/unblock
PUT /api/admin/users/:id/block
===============================
*/
router.put("/users/:id/block", protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const willBlock = !(user.accountStatus === "blocked" || user.isBlocked);
    user.isBlocked = willBlock;
    user.accountStatus = willBlock ? "blocked" : "active";
    await user.save();

    await logActivity({
      type: willBlock ? "user_blocked" : "user_unblocked",
      description: willBlock ? "User blocked" : "User unblocked",
      userId: user._id,
      userName: user.name,
      metadata: { updatedBy: req.user._id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
===============================
DELETE Opportunity (Admin Only)
DELETE /api/admin/opportunities/:id
===============================
*/
router.delete("/opportunities/:id", protect, requireAdmin, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    await Application.deleteMany({
      opportunity_id: opportunity._id,
    });

    await opportunity.deleteOne();

    await logActivity({
      type: "opportunity_deleted",
      description: "Opportunity deleted by admin",
      userId: req.user._id,
      userName: req.user.name,
      metadata: { opportunityId: req.params.id, title: opportunity.title },
    });

    res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

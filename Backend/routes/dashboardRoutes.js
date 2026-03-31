const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");

router.get("/stats", protect, async (req, res) => {
  try {
    let stats = {};

   if (req.user.role === "ngo") {

      const totalOpportunities = await Opportunity.countDocuments({
        ngo_id: req.user._id,
      });

      const activeOpportunities = await Opportunity.countDocuments({
        ngo_id: req.user._id,
        status: "open",
      });

      const completedProjects = await Opportunity.countDocuments({
        ngo_id: req.user._id,
        status: "closed",
      });

      const opportunities = await Opportunity.find({
        ngo_id: req.user._id,
      }).select("_id");

      const opportunityIds = opportunities.map(op => op._id);

      const totalApplications = await Application.countDocuments({
        opportunity_id: { $in: opportunityIds },
      });

      const recentApplications = await Application.find({
        opportunity_id: { $in: opportunityIds },
      })
        .populate("volunteer_id", "name")
        .populate("opportunity_id", "title")
        .sort({ createdAt: -1 })
        .limit(5);

      // ✅ Monthly aggregation INSIDE route
      const monthlyApplications = await Application.aggregate([
        {
          $lookup: {
            from: "opportunities",
            localField: "opportunity_id",
            foreignField: "_id",
            as: "opportunity",
          },
        },
        { $unwind: "$opportunity" },
        {
          $match: {
            "opportunity.ngo_id": req.user._id,
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id": 1 } },
      ]);

      stats = {
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        completedProjects,
        recentApplications,
        monthlyApplications,
      };
    } else if (req.user.role === "volunteer") {
      const totalOpen = await Opportunity.countDocuments({
        status: "open",
      });

      const totalApplied = await Application.countDocuments({
        volunteer_id: req.user._id,
      });

      const accepted = await Application.countDocuments({
        volunteer_id: req.user._id,
        status: "accepted",
      });

      const pending = await Application.countDocuments({
        volunteer_id: req.user._id,
        status: "pending",
      });

      stats = {
        totalOpen,
        totalApplied,
        accepted,
        pending,
      };
    } else if (req.user.role === "admin") {
      const total = await Opportunity.countDocuments();
      stats = { total };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
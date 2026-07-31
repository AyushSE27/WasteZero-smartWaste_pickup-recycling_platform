const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

/*
====================================
GET APPLICANTS (WITH MATCH SCORE)
====================================
*/
router.get("/opportunity/:id", protect, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const applications = await Application.find({
      opportunity_id: req.params.id,
    }).populate("volunteer_id", "name email location skills");

    const rankedApplications = applications.map((app) => {
      const volunteer = app.volunteer_id;

      const matchedSkills = volunteer.skills.filter((skill) =>
        opportunity.required_skills.includes(skill)
      );

      const skillScore =
        opportunity.required_skills.length > 0
          ? (matchedSkills.length / opportunity.required_skills.length) * 100
          : 0;

      const locationScore =
        volunteer.location === opportunity.location ? 20 : 0;

      const totalScore = Math.round(skillScore + locationScore);

      return {
        ...app._doc,
        matchScore: totalScore,
      };
    });

    rankedApplications.sort((a, b) => b.matchScore - a.matchScore);

    res.json(rankedApplications);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
APPLY TO OPPORTUNITY
====================================
*/
router.post("/:opportunityId", protect, async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers can apply" });
    }

    const existing = await Application.findOne({
      volunteer_id: req.user._id,
      opportunity_id: req.params.opportunityId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      volunteer_id: req.user._id,
      opportunity_id: req.params.opportunityId,
    });

    // 🔔 Create notification for NGO
    const opportunity = await Opportunity.findById(req.params.opportunityId);

    if (opportunity) {
      await Notification.create({
        user_id: opportunity.ngo_id,
        message: `${req.user.name} applied to "${opportunity.title}"`,
      });
    }

    res.status(201).json(application);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
GET MY APPLICATIONS
====================================
*/
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers allowed" });
    }

    const applications = await Application.find({
      volunteer_id: req.user._id,
    }).populate("opportunity_id");

    res.json(applications);

  } catch (error) {
    console.log("MY APPLICATIONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
ACCEPT / REJECT
====================================
*/
router.put("/:applicationId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    // 🔔 Notify volunteer
    await Notification.create({
      user_id: application.volunteer_id,
      message: `Your application has been ${status}`,
    });

    res.json(application);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
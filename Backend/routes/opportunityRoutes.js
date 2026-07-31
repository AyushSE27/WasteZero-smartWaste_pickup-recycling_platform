const express = require("express");
const router = express.Router();
const Opportunity = require("../models/Opportunity");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const mongoose = require("mongoose");
const Application = require("../models/Application");


/*
========================================
1️⃣ CREATE Opportunity and UPLOAD Image
========================================
*/
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, duration, location, date, required_skills } =
      req.body;

    const parsedSkills = required_skills ? JSON.parse(required_skills) : [];

    const opportunity = await Opportunity.create({
      ngo_id: req.user._id,
      title,
      description,
      duration,
      location,
      date: date || null,
      required_skills: parsedSkills,
      image: req.file ? req.file.path : null,
    });

    res.status(201).json(opportunity);
  } catch (error) {
    console.log("CREATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
========================================
2️⃣ GET ALL Opportunities
========================================
*/
router.get("/", protect, async (req, res) => {
  try {
    let opportunities;

    if (req.user.role === "ngo") {
      // NGO sees only their own
      opportunities = await Opportunity.find({
        ngo_id: req.user._id,
      }).populate("ngo_id", "name");
    } else if (req.user.role === "admin") {
      // Admin sees all
      opportunities = await Opportunity.find().populate("ngo_id", "name");
    } else {
      // Volunteers see only open opportunities
      opportunities = await Opportunity.find({
        status: "open",
      }).populate("ngo_id", "name");
    }

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
GET Single Opportunity
====================================
*/
router.get("/:id", async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "ngo_id",
      "name email",
    );

    if (!opportunity) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
========================================
4️⃣ DELETE Opportunity
========================================
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });

    if (
      req.user.role !== "admin" &&
      opportunity.ngo_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 IMPORTANT FIX
    await Application.deleteMany({
      opportunity_id: opportunity._id,
    });

    await opportunity.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
====================================
UPDATE Opportunity
====================================
*/
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Only NGO owner or admin can update
    if (
      req.user.role !== "admin" &&
      opportunity.ngo_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, duration, location, date, required_skills, status } =
      req.body;

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.date = date || opportunity.date;
    opportunity.status = status || opportunity.status;

    if (required_skills) {
      opportunity.required_skills = JSON.parse(required_skills);
    }

    if (req.file) {
      opportunity.image = req.file.path;
    }

    await opportunity.save();

    res.json({ message: "Opportunity updated successfully", opportunity });

  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

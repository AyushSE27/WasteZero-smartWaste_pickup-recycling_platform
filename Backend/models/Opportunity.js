const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    required_skills: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
    date: {
      type: Date,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
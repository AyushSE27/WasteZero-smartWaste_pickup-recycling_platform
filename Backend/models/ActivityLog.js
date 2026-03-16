const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "user_registered",
        "pickup_created",
        "pickup_assigned",
        "pickup_completed",
        "pickup_status_updated",
        "user_edited",
        "user_suspended",
        "user_blocked",
        "user_unblocked",
        "user_unsuspended",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
    },
    requestId: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);


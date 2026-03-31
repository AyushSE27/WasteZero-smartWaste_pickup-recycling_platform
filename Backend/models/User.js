const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["volunteer", "ngo", "admin"],
      default: "volunteer",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "blocked"],
      default: "active",
      index: true,
    },
    // Backwards-compatible flag used by older admin UI
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
    },
    defaultPickupLocation: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pickupUpdates: {
        type: Boolean,
        default: true,
      },
      reminderAlerts: {
        type: Boolean,
        default: true,
      },
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      pickupUpdates: {
        type: Boolean,
        default: true,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true },
);

/* Hash Password Before Save */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* Compare Password */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

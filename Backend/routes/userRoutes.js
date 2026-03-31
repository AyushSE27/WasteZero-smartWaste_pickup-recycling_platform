const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  getUserSettings,
  updatePreferences,
  updateLocationPreference,
  uploadAvatar,
  exportUserData,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WEBP files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/settings", protect, getUserSettings);
router.put("/preferences", protect, updatePreferences);
router.put("/location", protect, updateLocationPreference);
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/export-data", protect, exportUserData);
router.delete("/delete-account", protect, deleteAccount);

router.use((error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(400).json({ message: error.message || "Upload failed" });
});

module.exports = router;

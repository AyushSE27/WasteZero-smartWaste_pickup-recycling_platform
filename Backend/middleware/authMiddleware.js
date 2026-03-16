const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // If account is blocked/suspended, deny access to protected routes
    if (req.user.accountStatus === "blocked" || req.user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (req.user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    next();

  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
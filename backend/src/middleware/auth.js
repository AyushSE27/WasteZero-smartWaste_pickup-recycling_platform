import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getCollections } from "../config/database.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const { users } = getCollections();
    const user = await users.findOne({ id: payload.id });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.suspended) {
      return res.status(403).json({ message: "User is suspended" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

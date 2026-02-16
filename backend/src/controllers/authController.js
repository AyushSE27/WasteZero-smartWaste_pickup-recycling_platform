import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCollections } from "../config/database.js";
import { env } from "../config/env.js";
import { makeId, publicUser } from "../utils/helpers.js";

const sign = (user) => jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { name, email, password, role = "volunteer", skills = [], location = "", bio = "" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const { users } = getCollections();
  const exists = await users.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const user = {
    id: makeId(),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 8),
    role,
    skills,
    location,
    bio,
    suspended: false
  };

  await users.insertOne(user);
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { users } = getCollections();
  const user = await users.findOne({ email: (email || "").toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.suspended) {
    return res.status(403).json({ message: "User is suspended" });
  }

  const ok = await bcrypt.compare(password || "", user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({ token: sign(user), user: publicUser(user) });
};

export const me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};

import { getCollections } from "../config/database.js";
import { publicUser } from "../utils/helpers.js";
import { addAdminLog } from "../services/activityService.js";

export const getUsers = async (_req, res) => {
  const { users } = getCollections();
  const rows = await users.find().toArray();
  res.json({ users: rows.map(publicUser) });
};

export const getContacts = async (req, res) => {
  const { users } = getCollections();
  const contacts = await users
    .find({ id: { $ne: req.user.id } }, { projection: { _id: 0, id: 1, name: 1, role: 1, location: 1 } })
    .toArray();
  res.json({ contacts });
};

export const updateProfile = async (req, res) => {
  const { users } = getCollections();
  const { name, skills, location, bio } = req.body;

  const patch = {};
  if (name !== undefined) patch.name = name;
  if (skills !== undefined) patch.skills = skills;
  if (location !== undefined) patch.location = location;
  if (bio !== undefined) patch.bio = bio;

  await users.updateOne({ id: req.user.id }, { $set: patch });
  const user = await users.findOne({ id: req.user.id });

  res.json({ user: publicUser(user) });
};

export const suspendUser = async (req, res) => {
  const { users } = getCollections();
  const user = await users.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ message: "User not found" });

  await users.updateOne({ id: req.params.id }, { $set: { suspended: true } });
  await addAdminLog({ userId: req.user.id, action: `Suspended user ${user.email}` });

  const updated = await users.findOne({ id: req.params.id });
  res.json({ message: "User suspended", user: publicUser(updated) });
};

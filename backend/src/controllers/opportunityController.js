import { getCollections } from "../config/database.js";
import { makeId } from "../utils/helpers.js";
import { matchVolunteersForOpportunity } from "../services/matchingService.js";
import { pushNotification, addAdminLog } from "../services/activityService.js";

const withoutMongoId = ({ _id, ...doc }) => doc;

export const listOpportunities = async (req, res) => {
  const { opportunities } = getCollections();
  const status = req.query.status;
  const query = status ? { status } : {};
  const rows = await opportunities.find(query).sort({ _id: -1 }).toArray();
  res.json({ opportunities: rows.map(withoutMongoId) });
};

export const createOpportunity = async (req, res) => {
  const { opportunities } = getCollections();
  const { title, description, required_skills = [], duration, location, wasteType = "plastic" } = req.body;

  if (!title || !description || !duration || !location) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const item = {
    id: makeId(),
    ngo_id: req.user.id,
    title,
    description,
    required_skills,
    duration,
    location,
    status: "open",
    wasteType
  };

  await opportunities.insertOne(item);

  const matches = await matchVolunteersForOpportunity(item);
  await Promise.all(
    matches.map((volunteer) =>
      pushNotification({
        userId: volunteer.id,
        title: "New Opportunity Match",
        message: `${item.title} matches your profile`
      })
    )
  );

  await addAdminLog({ userId: req.user.id, action: `Created opportunity ${item.title}` });

  res.status(201).json({ opportunity: item, suggestedVolunteers: matches });
};

export const updateOpportunity = async (req, res) => {
  const { opportunities } = getCollections();
  const item = await opportunities.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ message: "Opportunity not found" });

  if (req.user.role !== "admin" && item.ngo_id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patch = { ...req.body };
  delete patch.id;
  delete patch.ngo_id;

  await opportunities.updateOne({ id: req.params.id }, { $set: patch });
  const updated = await opportunities.findOne({ id: req.params.id });
  res.json({ opportunity: withoutMongoId(updated) });
};

export const deleteOpportunity = async (req, res) => {
  const { opportunities } = getCollections();
  const item = await opportunities.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ message: "Opportunity not found" });

  if (req.user.role !== "admin" && item.ngo_id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await opportunities.deleteOne({ id: req.params.id });
  await addAdminLog({ userId: req.user.id, action: `Deleted opportunity ${item.title}` });

  res.json({ message: "Deleted" });
};

export const matchForOpportunity = async (req, res) => {
  const { opportunities } = getCollections();
  const item = await opportunities.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ message: "Opportunity not found" });

  const matches = await matchVolunteersForOpportunity(item);
  res.json({ matches });
};

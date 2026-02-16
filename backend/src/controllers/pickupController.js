import { getCollections } from "../config/database.js";
import { makeId, nowISO } from "../utils/helpers.js";
import { matchAgentsForPickup } from "../services/matchingService.js";
import { pushNotification } from "../services/activityService.js";

const withoutMongoId = ({ _id, ...doc }) => doc;

export const createPickup = async (req, res) => {
  const { pickups } = getCollections();
  const { wasteType, location, address, scheduledAt, notes = "" } = req.body;

  if (!wasteType || !location || !address || !scheduledAt) {
    return res.status(400).json({ message: "wasteType, location, address, scheduledAt are required" });
  }

  const pickup = {
    id: makeId(),
    userId: req.user.id,
    wasteType,
    location,
    address,
    scheduledAt,
    notes,
    createdAt: nowISO(),
    status: "scheduled",
    assignedAgentId: null
  };

  const agent = await matchAgentsForPickup(pickup);
  if (agent) {
    pickup.assignedAgentId = agent.id;
    pickup.status = "assigned";
    await pushNotification({
      userId: agent.id,
      title: "New Pickup Assignment",
      message: `Pickup assigned for ${pickup.wasteType} at ${pickup.location}`
    });
  }

  await pickups.insertOne(pickup);
  res.status(201).json({ pickup });
};

export const listPickups = async (req, res) => {
  const { pickups } = getCollections();
  if (req.user.role === "admin") {
    const rows = await pickups.find().sort({ _id: -1 }).toArray();
    return res.json({ pickups: rows.map(withoutMongoId) });
  }
  if (req.user.role === "agent") {
    const rows = await pickups.find({ assignedAgentId: req.user.id }).sort({ _id: -1 }).toArray();
    return res.json({ pickups: rows.map(withoutMongoId) });
  }
  const rows = await pickups.find({ userId: req.user.id }).sort({ _id: -1 }).toArray();
  return res.json({ pickups: rows.map(withoutMongoId) });
};

export const updatePickupStatus = async (req, res) => {
  const { pickups } = getCollections();
  const pickup = await pickups.findOne({ id: req.params.id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });

  const allowed =
    req.user.role === "admin" ||
    (req.user.role === "agent" && pickup.assignedAgentId === req.user.id) ||
    pickup.userId === req.user.id;

  if (!allowed) return res.status(403).json({ message: "Forbidden" });

  const status = req.body.status || pickup.status;
  await pickups.updateOne({ id: req.params.id }, { $set: { status } });

  await pushNotification({
    userId: pickup.userId,
    title: "Pickup Status Updated",
    message: `Pickup is now ${status}`
  });

  const updated = await pickups.findOne({ id: req.params.id });
  res.json({ pickup: withoutMongoId(updated) });
};

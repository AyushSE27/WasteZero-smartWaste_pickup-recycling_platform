import { getCollections } from "../config/database.js";
import { buildAdminReport } from "../services/reportService.js";

const withoutMongoId = ({ _id, ...doc }) => doc;

export const listNotifications = async (req, res) => {
  const { notifications } = getCollections();
  const notes = await notifications.find({ userId: req.user.id }).sort({ _id: -1 }).toArray();
  res.json({ notifications: notes.map(withoutMongoId) });
};

export const readNotification = async (req, res) => {
  const { notifications } = getCollections();
  const note = await notifications.findOne({ id: req.params.id, userId: req.user.id });
  if (!note) return res.status(404).json({ message: "Notification not found" });

  await notifications.updateOne({ id: req.params.id }, { $set: { read: true } });
  const updated = await notifications.findOne({ id: req.params.id, userId: req.user.id });
  res.json({ notification: withoutMongoId(updated) });
};

export const getAdminLogs = async (_req, res) => {
  const { adminLogs } = getCollections();
  const logs = await adminLogs.find().sort({ _id: -1 }).toArray();
  res.json({ logs: logs.map(withoutMongoId) });
};

export const getAdminReport = async (_req, res) => {
  const report = await buildAdminReport();
  res.json({ report });
};

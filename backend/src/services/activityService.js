import { getCollections } from "../config/database.js";
import { makeId, nowISO } from "../utils/helpers.js";

export const pushNotification = async ({ userId, title, message }) => {
  const { notifications } = getCollections();
  const note = {
    id: makeId(),
    userId,
    title,
    message,
    read: false,
    timestamp: nowISO()
  };
  await notifications.insertOne(note);
  return note;
};

export const addAdminLog = async ({ userId, action }) => {
  const { adminLogs } = getCollections();
  const log = {
    id: makeId(),
    user_id: userId,
    action,
    timestamp: nowISO()
  };
  await adminLogs.insertOne(log);
  return log;
};

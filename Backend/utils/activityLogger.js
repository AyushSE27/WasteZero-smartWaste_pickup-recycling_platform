const ActivityLog = require("../models/ActivityLog");

async function logActivity({
  type,
  description,
  userId,
  userName,
  requestId,
  metadata,
}) {
  try {
    await ActivityLog.create({
      type,
      description,
      userId,
      userName,
      requestId,
      metadata: metadata || {},
    });
  } catch (err) {
    // Logging should never break primary flows
    // eslint-disable-next-line no-console
    console.warn("Activity log failed:", err?.message || err);
  }
}

module.exports = { logActivity };
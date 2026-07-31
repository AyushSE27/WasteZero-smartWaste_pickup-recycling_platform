
const getNotificationPreferences = (user) => ({
  email: user?.notifications?.email ?? user?.preferences?.emailNotifications ?? true,
  pickupUpdates:
    user?.notifications?.pickupUpdates ?? user?.preferences?.pickupUpdates ?? true,
  reminders: user?.notifications?.reminders ?? user?.preferences?.reminderAlerts ?? true,
});

module.exports = { getNotificationPreferences };

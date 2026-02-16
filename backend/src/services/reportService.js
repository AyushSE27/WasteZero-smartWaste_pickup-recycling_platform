import { getCollections } from "../config/database.js";

export const buildAdminReport = async () => {
  const { users, opportunities, applications, messages, notifications, adminLogs, pickups } = getCollections();

  const [
    usersList,
    opportunitiesList,
    pickupList,
    usersCount,
    opportunitiesCount,
    applicationsCount,
    messagesCount,
    notificationsCount,
    adminLogsCount,
    pickupsCount,
    openOpportunities
  ] = await Promise.all([
    users.find().toArray(),
    opportunities.find().toArray(),
    pickups.find().toArray(),
    users.countDocuments(),
    opportunities.countDocuments(),
    applications.countDocuments(),
    messages.countDocuments(),
    notifications.countDocuments(),
    adminLogs.countDocuments(),
    pickups.countDocuments(),
    opportunities.countDocuments({ status: "open" })
  ]);

  const roleBreakdown = usersList.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const pickupStats = pickupList.reduce(
    (acc, pickup) => {
      acc.total += 1;
      acc[pickup.status] = (acc[pickup.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      users: usersCount,
      opportunities: opportunitiesCount,
      applications: applicationsCount,
      messages: messagesCount,
      notifications: notificationsCount,
      adminLogs: adminLogsCount,
      pickups: pickupsCount,
      openOpportunities
    },
    roleBreakdown,
    pickupStats,
    highlights: {
      latestOpportunity: opportunitiesList[0]?.title || null
    }
  };
};

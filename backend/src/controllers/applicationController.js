import { getCollections } from "../config/database.js";
import { makeId } from "../utils/helpers.js";
import { pushNotification } from "../services/activityService.js";

const withoutMongoId = ({ _id, ...doc }) => doc;

export const applyToOpportunity = async (req, res) => {
  const { opportunities, applications } = getCollections();
  const opportunity = await opportunities.findOne({ id: req.params.id });
  if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

  const exists = await applications.findOne({
    opportunity_id: opportunity.id,
    volunteer_id: req.user.id
  });
  if (exists) return res.status(409).json({ message: "Already applied" });

  const application = {
    id: makeId(),
    opportunity_id: opportunity.id,
    volunteer_id: req.user.id,
    status: "pending"
  };

  await applications.insertOne(application);

  await pushNotification({
    userId: opportunity.ngo_id,
    title: "New Application",
    message: `${req.user.name} applied to ${opportunity.title}`
  });

  res.status(201).json({ application });
};

export const listApplications = async (req, res) => {
  const { opportunities, applications } = getCollections();

  if (req.user.role === "volunteer") {
    const rows = await applications.find({ volunteer_id: req.user.id }).sort({ _id: -1 }).toArray();
    return res.json({ applications: rows.map(withoutMongoId) });
  }

  if (req.user.role === "ngo") {
    const myOpportunityIds = await opportunities
      .find({ ngo_id: req.user.id }, { projection: { id: 1, _id: 0 } })
      .toArray();
    const ids = myOpportunityIds.map((o) => o.id);
    const rows = await applications.find({ opportunity_id: { $in: ids } }).sort({ _id: -1 }).toArray();
    return res.json({ applications: rows.map(withoutMongoId) });
  }

  const rows = await applications.find().sort({ _id: -1 }).toArray();
  return res.json({ applications: rows.map(withoutMongoId) });
};

export const updateApplicationStatus = async (req, res) => {
  const { applications } = getCollections();
  const app = await applications.findOne({ id: req.params.id });
  if (!app) return res.status(404).json({ message: "Application not found" });

  const nextStatus = req.body.status || app.status;
  await applications.updateOne({ id: req.params.id }, { $set: { status: nextStatus } });

  await pushNotification({
    userId: app.volunteer_id,
    title: "Application Update",
    message: `Your application status is now ${nextStatus}`
  });

  const updated = await applications.findOne({ id: req.params.id });
  res.json({ application: withoutMongoId(updated) });
};

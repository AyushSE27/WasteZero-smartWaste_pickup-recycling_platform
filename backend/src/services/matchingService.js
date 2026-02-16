import { getCollections } from "../config/database.js";
import { publicUser } from "../utils/helpers.js";

export const matchVolunteersForOpportunity = async (opportunity) => {
  const { users } = getCollections();
  const volunteers = await users.find({ role: "volunteer", suspended: { $ne: true } }).toArray();

  return volunteers
    .map((volunteer) => {
      const volunteerSkills = Array.isArray(volunteer.skills) ? volunteer.skills : [];
      const requiredSkills = Array.isArray(opportunity.required_skills) ? opportunity.required_skills : [];
      const skillOverlap = volunteerSkills.filter((skill) => requiredSkills.includes(skill)).length;
      const locationScore =
        String(volunteer.location || "").toLowerCase() ===
        String(opportunity.location || "").toLowerCase()
          ? 2
          : 0;
      const score = skillOverlap + locationScore;
      return { volunteer, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => publicUser(entry.volunteer));
};

export const matchAgentsForPickup = async (pickup) => {
  const { users } = getCollections();
  const agents = await users.find({ role: "agent", suspended: { $ne: true } }).toArray();
  let best = null;

  for (const agent of agents) {
    const skills = Array.isArray(agent.skills) ? agent.skills : [];
    const hasWasteType = skills.includes(pickup.wasteType) ? 2 : 0;
    const sameLocation =
      String(agent.location || "").toLowerCase() === String(pickup.location || "").toLowerCase() ? 2 : 0;
    const score = hasWasteType + sameLocation;

    if (!best || score > best.score) {
      best = { agent, score };
    }
  }

  return best && best.score > 0 ? publicUser(best.agent) : null;
};

import { Router } from "express";
import {
  createOpportunity,
  deleteOpportunity,
  listOpportunities,
  matchForOpportunity,
  updateOpportunity
} from "../controllers/opportunityController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listOpportunities);
router.get("/:id/matches", requireAuth, matchForOpportunity);
router.post("/", requireAuth, allowRoles("ngo", "admin"), createOpportunity);
router.patch("/:id", requireAuth, allowRoles("ngo", "admin"), updateOpportunity);
router.delete("/:id", requireAuth, allowRoles("ngo", "admin"), deleteOpportunity);

export default router;

import { Router } from "express";
import {
  applyToOpportunity,
  listApplications,
  updateApplicationStatus
} from "../controllers/applicationController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listApplications);
router.post("/opportunity/:id", allowRoles("volunteer", "admin"), applyToOpportunity);
router.patch("/:id", allowRoles("ngo", "admin"), updateApplicationStatus);

export default router;

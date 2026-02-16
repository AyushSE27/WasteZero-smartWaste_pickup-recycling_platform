import { Router } from "express";
import {
  getAdminLogs,
  getAdminReport,
  listNotifications,
  readNotification
} from "../controllers/adminController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", readNotification);
router.get("/logs", allowRoles("admin"), getAdminLogs);
router.get("/report", allowRoles("admin"), getAdminReport);

export default router;

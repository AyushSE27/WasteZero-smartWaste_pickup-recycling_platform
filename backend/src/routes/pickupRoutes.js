import { Router } from "express";
import { createPickup, listPickups, updatePickupStatus } from "../controllers/pickupController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listPickups);
router.post("/", createPickup);
router.patch("/:id", updatePickupStatus);

export default router;

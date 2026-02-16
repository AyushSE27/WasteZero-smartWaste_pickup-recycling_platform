import { Router } from "express";
import { getContacts, getUsers, suspendUser, updateProfile } from "../controllers/userController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/contacts", getContacts);
router.get("/", allowRoles("admin"), getUsers);
router.patch("/me", updateProfile);
router.patch("/:id/suspend", allowRoles("admin"), suspendUser);

export default router;

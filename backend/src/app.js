import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import pickupRoutes from "./routes/pickupRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

export const createApp = (origin) => {
  const app = express();

  app.use(cors({ origin, credentials: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "WasteZero API running (MongoDB mode)" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/opportunities", opportunityRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/pickups", pickupRoutes);
  app.use("/api/admin", adminRoutes);

  return app;
};

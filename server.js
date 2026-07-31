const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ── SOCKET.IO ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.receiverId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ── MIDDLEWARE ─────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ── DATABASE ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── ROUTES ─────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/pickups",       require("./routes/pickupRoutes"));
app.use("/api/applications",  require("./routes/applicationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/dashboard",     require("./routes/dashboardRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));

// ── START ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
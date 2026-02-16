import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase, getCollections } from "./config/database.js";
import { createApp } from "./app.js";
import { makeId, nowISO } from "./utils/helpers.js";

const app = createApp(env.clientOrigin);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true }
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });

  socket.on("message:send", async ({ sender_id, receiver_id, content }) => {
    if (!sender_id || !receiver_id || !content) return;

    try {
      const { messages, notifications } = getCollections();

      const message = {
        id: makeId(),
        sender_id,
        receiver_id,
        content,
        timestamp: nowISO()
      };

      await messages.insertOne(message);
      io.to(receiver_id).emit("message:new", message);
      io.to(sender_id).emit("message:new", message);

      const note = {
        id: makeId(),
        userId: receiver_id,
        title: "New Message",
        message: "You have a new message",
        read: false,
        timestamp: nowISO()
      };
      await notifications.insertOne(note);
      io.to(receiver_id).emit("notification:new", note);
    } catch (error) {
      console.error("Socket message error:", error);
    }
  });
});

await connectDatabase();
server.listen(env.port, () => {
  console.log(`WasteZero backend running on http://localhost:${env.port}`);
});

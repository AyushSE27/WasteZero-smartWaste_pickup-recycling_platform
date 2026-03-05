import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Messages = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const messagesEndRef = useRef(null);

  // Join personal room
  useEffect(() => {
    if (userId) {
      socket.emit("joinRoom", userId);
    }

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  // Fetch old messages when receiver changes
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(res.data);
    };

    fetchMessages();
  }, [receiverId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!content || !receiverId) return;

    const messageData = {
      senderId: userId,
      receiverId,
      message: content,
    };

    // Emit to socket
    socket.emit("sendMessage", messageData);

    // Save to DB
    await axios.post(
      "http://localhost:5000/api/messages",
      { receiver: receiverId, content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMessages((prev) => [...prev, messageData]);
    setContent("");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Real-Time Chat</h2>

      <input
        placeholder="Enter Receiver User ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        style={{ width: "100%", marginBottom: 15, padding: 8 }}
      />

      <div
        style={{
          height: 350,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => {
          const isMine =
            msg.senderId === userId || msg.sender === userId;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  background: isMine ? "#2d89ef" : "#e5e5ea",
                  color: isMine ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "60%",
                }}
              >
                {msg.message || msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          placeholder="Type message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "10px 15px",
            marginLeft: 5,
            background: "#2d89ef",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
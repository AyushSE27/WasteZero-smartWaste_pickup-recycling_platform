import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";
import { getMessages, sendMessage } from "../services/messageService";

const ChatPage = ({ user }) => {
  const token = localStorage.getItem("token");
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  /* JOIN SOCKET ROOM */
  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", loggedUser._id);

    socket.on("receiveMessage", (msg) => {
      if (
        msg.sender === user._id ||
        msg.receiver === user._id ||
        msg.senderId === user._id ||
        msg.receiverId === user._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [user]);

  /* LOAD OLD MESSAGES */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await getMessages(user._id, token);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
  }, [user]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const messageContent = text.trim();

    const msg = {
      receiverId: user._id,
      content: messageContent,
    };

    try {
      const res = await sendMessage(msg, token);

      socket.emit("sendMessage", {
        senderId: loggedUser._id,
        receiverId: user._id,
        content: messageContent,
      });

      setMessages((prev) => [...prev, res.data]);

      setText("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const isMine = (msg) => {
    const senderId =
      typeof msg.sender === "object"
        ? msg.sender?._id
        : msg.sender || msg.senderId;

    return String(senderId) === String(loggedUser._id);
  };

  const getContent = (msg) => msg?.content || msg?.text || "";

  return (
    <div className="chat-box">
      <div className="chat-header">U {user.name}</div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div
            key={m._id || i}
            className={`bubble ${isMine(m) ? "right" : "left"}`}
          >
            {getContent(m)}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
};

export default ChatPage;
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import * as messageService from "../services/messageService";
import "./messages.css";

const socket = io("http://localhost:5000");

const Messages = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const myId = String(user?._id || user?.id || "");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const endRef = useRef(null);

  /* JOIN SOCKET ROOM */
  useEffect(() => {
    if (myId) socket.emit("joinRoom", myId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        const senderId = String(
          typeof msg.sender === "object" ? msg.sender?._id : msg.sender,
        );
        if (senderId === String(selectedUser?._id)) {
          return [...prev, msg];
        }
        return prev;
      });
    });

    return () => socket.off("receiveMessage");
  }, [selectedUser, myId]);

  /* LOAD USERS */
  useEffect(() => {
    setLoadingUsers(true);
    messageService
      .getUsers(token)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoadingUsers(false));
  }, [token]);

  /* OPEN CHAT */
  const openChat = async (u) => {
    setSelectedUser(u);
    try {
      const res = await messageService.getMessages(u._id, token);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    }
  };

  /* SEND MESSAGE */
const send = async () => {
  if (!text.trim() || !selectedUser) return;

  const content = text.trim();
  setText("");

  // temporary message for instant UI
  const tempMsg = {
    _id: `temp-${Date.now()}`,
    sender: myId,
    receiver: selectedUser._id,
    content,
    createdAt: new Date().toISOString(),
    pending: true,
  };

  setMessages((prev) => [...prev, tempMsg]);

  try {
    // save to database
    const res = await messageService.sendMessage(
      { receiverId: selectedUser._id, content },
      token
    );

    // emit realtime socket message
    socket.emit("sendMessage", {
      senderId: myId,
      receiverId: selectedUser._id,
      content,
    });

    // replace temp message with real one
    setMessages((prev) =>
      prev.map((m) => (m._id === tempMsg._id ? res.data : m))
    );

  } catch (err) {
    console.error("Failed to send:", err);

    // remove temp message
    setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));

    setText(content);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ✅ KEY FIX: compare both as strings */
  const isSentByMe = (msg) => {
    const senderId = String(
      typeof msg.sender === "object" ? msg.sender?._id : msg.sender,
    );
    return senderId === myId;
  };

  // ✅ Model uses 'text' field only
  const getContent = (msg) => msg.content || "";

  const getName = (u) => u?.name || u?.username || u?.email || "Unknown";
  const getInitial = (u) => getName(u)[0].toUpperCase();

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((u) =>
    getName(u).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="messaging-page">
      <div className="page-title">
        <h1>Messages</h1>
        <p>Chat with volunteers, NGOs, and waste management partners</p>
      </div>

      <div className="messaging-container">
        {/* LEFT SIDEBAR */}
        <div className="chat-sidebar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="users-list">
            {loadingUsers ? (
              <div className="no-users">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="no-users">No users found</div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className={`user-item ${
                    selectedUser?._id === u._id ? "active" : ""
                  }`}
                  onClick={() => openChat(u)}
                >
                  <div className="avatar">{getInitial(u)}</div>
                  <div className="user-info">
                    <strong>{getName(u)}</strong>
                    <div className="preview">Click to chat</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div className="chat-window">
          {!selectedUser ? (
            <div className="empty-chat">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="avatar">{getInitial(selectedUser)}</div>
                <span>{getName(selectedUser)}</span>
              </div>

              <div className="message-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={m._id || i}
                      className={`message-wrapper ${isSentByMe(m) ? "own" : ""}`}
                    >
                      <div
                        className={`message-bubble ${m.pending ? "pending" : ""}`}
                      >
                        <div className="message-content">{getContent(m)}</div>
                        <div className="message-time">
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <div className="input-area">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${getName(selectedUser)}...`}
                />
                <button
                  className="send-btn"
                  onClick={send}
                  disabled={!text.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

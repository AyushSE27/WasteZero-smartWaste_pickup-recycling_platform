import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false
});

const MessagesPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await api.get("/users/contacts");
      setContacts(data.contacts || []);
      if (data.contacts?.[0]) setActiveUser(data.contacts[0].id);
    };
    init();
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit("join", user.id);

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message:new", onMessage);
    return () => {
      socket.off("message:new", onMessage);
      socket.disconnect();
    };
  }, [user.id]);

  useEffect(() => {
    const load = async () => {
      if (!activeUser) return;
      const { data } = await api.get(`/messages?withUser=${activeUser}`);
      setMessages(data.messages || []);
    };
    load();
  }, [activeUser]);

  const filteredContacts = useMemo(
    () => contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query]
  );

  const activeContact = contacts.find((c) => c.id === activeUser);

  const chatMessages = useMemo(
    () => messages.filter((m) => m.sender_id === activeUser || m.receiver_id === activeUser),
    [messages, activeUser]
  );

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;

    const payload = { sender_id: user.id, receiver_id: activeUser, content: text.trim() };
    socket.emit("message:send", payload);
    setText("");
  };

  return (
    <section>
      <header className="page-head">
        <h1>Messages</h1>
        <p>Chat with volunteers, NGOs, and waste management partners</p>
      </header>

      <div className="message-layout card">
        <aside className="conversation-list">
          <input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="conversation-items">
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                className={`conversation-item ${c.id === activeUser ? "active" : ""}`}
                onClick={() => setActiveUser(c.id)}
              >
                <div className="avatar">{c.name?.[0] || "U"}</div>
                <div>
                  <strong>{c.name}</strong>
                  <p className="small">You: {c.role}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="chat-panel">
          <header className="chat-header">
            <span className="avatar">{activeContact?.name?.[0] || "U"}</span>
            <strong>{activeContact?.name || "Select chat"}</strong>
          </header>

          <div className="chat-box">
            {chatMessages.map((m) => (
              <p key={m.id} className={m.sender_id === user.id ? "mine" : "other"}>
                {m.content}
              </p>
            ))}
          </div>

          <form onSubmit={send} className="message-composer">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
            <button type="submit">?</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default MessagesPage;

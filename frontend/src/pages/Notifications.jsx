import { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/notifications",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNotifications(res.data);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Notifications</h2>

      {notifications.map((n) => (
        <div
          key={n._id}
          style={{
            background: n.read ? "#f9f9f9" : "#eaf3ff",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <p>{n.message}</p>
          <small>
            {new Date(n.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
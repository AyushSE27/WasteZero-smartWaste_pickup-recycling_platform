import { useEffect, useState } from "react";
import axios from "axios";
import "./adminPickups.css";

const AdminPickups = () => {
  const [pickups, setPickups] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPickups(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    fetchPickups();
  };

  const deletePickup = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchPickups();
  };

  return (
    <div className="admin-pickups">
      <h2>Manage Pickups</h2>

      <div className="pickup-table">
        <div className="pickup-row header">
          <div>ID</div>
          <div>User</div>
          <div>Date</div>
          <div>City</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {pickups.map((p) => (
          <div key={p._id} className="pickup-row">
            <div>{p.pickupId}</div>
            <div>
              <div className="pickup-user-name">{p.user_id?.name}</div>
              <div className="pickup-user-email">{p.user_id?.email}</div>
            </div>
            <div>{new Date(p.date).toLocaleDateString()}</div>
            <div>{p.city}</div>

            <div>
              <select
                value={p.status}
                onChange={(e) => updateStatus(p._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="div-delete">
              <button
                className="delete-btn"
                onClick={() => deletePickup(p._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPickups;
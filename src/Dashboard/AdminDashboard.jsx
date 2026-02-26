import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaLeaf,
  FaFileDownload,
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const token = localStorage.getItem("token");

  // ✅ DEFINE FUNCTIONS FIRST

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const updateRole = async (id, role) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}/role`,
      { role },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    fetchUsers();
  };

  // ✅ NOW useEffect AFTER FUNCTIONS

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const filteredUsers = (() => {
    // If searching → search across ALL users
    if (searchTerm.trim() !== "") {
      return users.filter((user) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";

        return (
          name.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase())
        );
      });
    }

    // If not searching → show recent users only
    return users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5); // show only latest 5
  })();

  const toggleBlock = async (id) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}/toggle-block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    fetchUsers();
  };

  return (
    <div className="admin-panel">
      {/* HEADER */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and activity monitoring</p>
      </div>

      {/* ================= STATS ================= */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card gradient-blue">
          <FaUsers />
          <h4>Total Users</h4>
          <h2>{stats.totalUsers || 0}</h2>
        </div>

        <div className="admin-stat-card gradient-green">
          <FaCheckCircle />
          <h4>Completed Pickups</h4>
          <h2>{stats.completedPickups || 0}</h2>
        </div>

        <div className="admin-stat-card gradient-orange">
          <FaClock />
          <h4>Pending Pickups</h4>
          <h2>{stats.pendingPickups || 0}</h2>
        </div>

        <div className="admin-stat-card gradient-purple">
          <FaLeaf />
          <h4>Active Opportunities</h4>
          <h2>{stats.totalOpportunities || 0}</h2>
        </div>
      </div>

      {/* ================= REPORTS ================= */}
      <div className="admin-report-section">
        <div className="report-header">
          <h3>Generate Reports</h3>
          <p>Download platform analytics and system reports</p>
        </div>

        <div className="report-buttons">
          <button className="report-btn">
            <FaFileDownload /> Users Report
          </button>

          <button className="report-btn">
            <FaFileDownload /> Pickups Report
          </button>

          <button className="report-btn">
            <FaFileDownload /> Opportunities Report
          </button>

          <button className="report-btn primary">
            <FaFileDownload /> Full Activity Report
          </button>
        </div>
      </div>
      {/* ================= MANAGE USERS ================= */}
      <div className="admin-manage-section">
        <h3>Manage Users</h3>
        <div className="user-controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="ngo">NGO</option>
            <option value="volunteer">Volunteer</option>
          </select> */}
        </div>
        <div className="user-table">
          {/* <div className="user-table-title">
            {searchTerm
              ? `Search Results (${filteredUsers.length})`
              : "Recent Users"}
          </div> */}
          <div className="user-table-row header">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Actions</div>
          </div>

          {filteredUsers.map((user) => (
            <div key={user._id} className="user-table-row">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <div className="user-actions">
                {/* <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO</option>
                  <option value="admin">Admin</option>
                </select> */}
                <div>
                  <span
                    className={`status-badge ${
                      user.isBlocked ? "blocked" : "active"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <button
                  className={`block-btn ${
                    user.isBlocked ? "unblock" : "block"
                  }`}
                  onClick={() => toggleBlock(user._id)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteUser(user._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

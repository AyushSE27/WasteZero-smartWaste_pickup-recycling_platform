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
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/stats",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setStats(res.data);
  };

  return (
    <div className="admin-panel">

      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage platform users, monitor activity, and generate reports</p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="admin-stats-grid">

        <div className="admin-stat-card">
          <FaUsers className="stat-icon blue" />
          <div>
            <p>Total Users</p>
            <h2>{stats.totalUsers || 0}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <FaCheckCircle className="stat-icon green" />
          <div>
            <p>Completed Pickups</p>
            <h2>{stats.completedPickups || 0}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <FaClock className="stat-icon yellow" />
          <div>
            <p>Pending Pickups</p>
            <h2>{stats.pendingPickups || 0}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <FaLeaf className="stat-icon purple" />
          <div>
            <p>Active Opportunities</p>
            <h2>{stats.totalOpportunities || 0}</h2>
          </div>
        </div>

      </div>

      {/* ===== Generate Reports Section ===== */}
      <div className="admin-card-section">
        <h3>Generate Reports</h3>
        <p>Download platform statistics and activity reports</p>

        <div className="report-buttons">
          <button><FaFileDownload /> Users Report</button>
          <button><FaFileDownload /> Pickups Report</button>
          <button><FaFileDownload /> Opportunities Report</button>
          <button><FaFileDownload /> Full Activity Report</button>
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;
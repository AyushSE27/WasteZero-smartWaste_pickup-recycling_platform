import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBullseye,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "axios";
import "./volunteerDashboard.css";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data);

      // Fetch open opportunities
      const oppRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/opportunities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOpportunities(oppRes.data);

      // Fetch my applications
      const appRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/applications/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setApplications(appRes.data);

      setLoading(false);
    } catch (error) {
      console.log("Error fetching volunteer dashboard:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="vd-container">Loading...</div>;

  return (
    <div className="vd-container">
      <h2 className="vd-title">Volunteer Dashboard</h2>

      {/* ================= STATS ================= */}
      <div className="vd-stats-grid">
        <div className="vd-stat-card primary">
          <FaBullseye />
          <h4>Available Opportunities</h4>
          <h2>{stats.totalOpen || 0}</h2>
        </div>

        <div className="vd-stat-card warning">
          <FaTasks />
          <h4>My Applications</h4>
          <h2>{stats.totalApplied || 0}</h2>
        </div>

        <div className="vd-stat-card success">
          <FaCheckCircle />
          <h4>Accepted</h4>
          <h2>{stats.accepted || 0}</h2>
        </div>

        <div className="vd-stat-card info">
          <FaClock />
          <h4>Pending</h4>
          <h2>{stats.pending || 0}</h2>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="vd-main-grid">
        {/* LEFT SIDE → OPPORTUNITIES */}
        <div className="vd-card">
          <div className="vd-card-header">
            <h3>Open Opportunities</h3>
          </div>

          <div className="vd-opportunity-grid">
            {opportunities.length === 0 ? (
              <p>No opportunities available</p>
            ) : (
              opportunities.map((op) => (
                <div key={op._id} className="vd-opportunity-card">
                  <h4>{op.title}</h4>

                  <p>
                    <FaCalendarAlt />
                    {op.date
                      ? new Date(op.date).toLocaleDateString()
                      : "Not specified"}
                  </p>

                  <p>
                    <FaMapMarkerAlt />
                    {op.location}
                  </p>

                  <div className="vd-opportunity-footer">
                    <span className="vd-badge badge-success">{op.status}</span>

                    <button
                      className="vd-btn"
                      onClick={() => navigate(`/opportunities/${op._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE → QUICK ACTIONS */}
        <div className="vd-side">
          <div className="vd-card">
            <div className="vd-card-header">
              <h3>Quick Actions</h3>
            </div>

            <button
              className="vd-action-btn"
              onClick={() => navigate("/opportunities")}
            >
              Browse Opportunities
            </button>

            <button
              className="vd-action-btn"
              onClick={() => navigate("/messages")}
            >
              Messages
            </button>

            <button
              className="vd-action-btn"
              onClick={() => navigate("/profile")}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ================= MY APPLICATIONS ================= */}
      <div className="vd-card">
        <div className="vd-card-header">
          <h3>My Applications</h3>
        </div>

        <table className="vd-table">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Applied Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="3">No applications yet</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.opportunity_id?.title}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`vd-badge ${
                        app.status === "accepted"
                          ? "badge-success"
                          : app.status === "pending"
                            ? "badge-warning"
                            : "badge-secondary"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VolunteerDashboard;

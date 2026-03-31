import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaLeaf,
  FaCheckCircle,
  FaClipboardList,
  FaTasks,
} from "react-icons/fa";
import "./ngoDashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const NgoDashboard = () => {
  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData =
    stats.monthlyApplications?.map((item) => ({
      month: monthNames[item._id - 1],
      applications: item.count,
    })) || [];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data);
  };
  const updateStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchStats(); // refresh dashboard
    } catch (error) {
      console.log("Error updating status");
    }
  };

  const handleDeleteOpportunity = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchStats(); // refresh dashboard
    } catch (error) {
      console.log("Error deleting opportunity");
    }
  };

  return (
    <div className="ngo-container">
      {/* Top Stats */}
      <div className="ngo-stats-grid">
        <div className="ngo-card blue">
          <FaLeaf />
          <h4>Total Opportunities</h4>
          <h2>{stats.totalOpportunities || 0}</h2>
        </div>

        <div className="ngo-card green">
          <FaCheckCircle />
          <h4>Active Opportunities</h4>
          <h2>{stats.activeOpportunities || 0}</h2>
        </div>

        <div className="ngo-card yellow">
          <FaClipboardList />
          <h4>Total Applications</h4>
          <h2>{stats.totalApplications || 0}</h2>
        </div>

        <div className="ngo-card teal">
          <FaTasks />
          <h4>Completed Projects</h4>
          <h2>{stats.completedProjects || 0}</h2>
        </div>
      </div>
      <div className="ngo-table-section">
        <div className="ngo-table-header">
          <h3>Manage Opportunities</h3>
          <button
            className="create-btn-small"
            onClick={() => navigate("/opportunities")}
          >
            {" "}
            + Create New{" "}
          </button>
        </div>{" "}
        {/* TABLE HEADER */}
        <div className="ngo-table-row header">
          <div>Opportunity</div>
          <div>Date</div>
          <div>Applications</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {/* DATA ROWS */}
        {stats.opportunities?.length === 0 ? (
          <div className="empty-state">No opportunities found.</div>
        ) : (
          stats.opportunities?.map((op) => (
            <div key={op._id} className="ngo-table-row">
              <div>{op.title}</div>
              <div>
                {" "}
                {op.date
                  ? new Date(op.date).toLocaleDateString()
                  : "Not specified"}{" "}
              </div>
              <div>{op.applicationCount || 0}</div>
              <div>
                <span className={`status ${op.status}`}>{op.status}</span>
              </div>
              <div className="action-buttons">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/opportunities/${op._id}`)}
                >
                  Edit
                </button>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/opportunities/${op._id}`)}
                >
                  View
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteOpportunity(op._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* ===== RECENT APPLICATIONS ===== */}
      <div className="ngo-table-section">
        <h3>Recent Applications</h3>
        {/* HEADER */}
        <div className="ngo-table-row header">
          <div>Opportunity</div>
          <div>Volunteer</div>
          <div>Applied Date</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {/* DATA ROWS */}
        {stats.recentApplications?.length === 0 ? (
          <div className="empty-state">No opportunities found.</div>
        ) : (
          stats.recentApplications?.map((app) => (
            <div key={app._id} className="ngo-table-row">
              <div>{app.opportunity_id?.title}</div>
              <div>{app.volunteer_id?.name}</div>
              <div>{new Date(app.createdAt).toLocaleDateString()}</div>
              <div>
                {" "}
                <span className={`status ${app.status}`}>{app.status}</span>
              </div>
              <div className="action-buttons">
                {" "}
                {app.status === "pending" ? (
                  <>
                    <button
                      className="accept-btn"
                      onClick={() => updateStatus(app._id, "accepted")}
                    >
                      {" "}
                      Accept{" "}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => updateStatus(app._id, "rejected")}
                    >
                      {" "}
                      Reject{" "}
                    </button>
                  </>
                ) : (
                  <span className="no-action">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chart */}
      <div className="ngo-chart">
        <h3>Monthly Applications</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#2d89ef"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NgoDashboard;

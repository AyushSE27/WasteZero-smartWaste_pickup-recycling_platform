import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaLeaf,
  FaClipboardList,
  FaChartLine,
  FaCheckCircle,
  FaTasks,
} from "react-icons/fa";
import "../layout/dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
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
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log("Error fetching dashboard data");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchStats(); // refresh dashboard
    } catch (error) {
      console.log("Error updating status");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Overview of your activity</p>
      </div>

      <div className="admin-stats-grid">
        {/* ADMIN */}
        {role === "admin" && (
          <>
            <div className="admin-card">
              <div className="card-icon users">
                <FaUsers />
              </div>
              <div>
                <h4>Total Users</h4>
                <h2>{stats.totalUsers}</h2>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-icon opportunities">
                <FaLeaf />
              </div>
              <div>
                <h4>Total Opportunities</h4>
                <h2>{stats.totalOpportunities}</h2>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-icon applications">
                <FaClipboardList />
              </div>
              <div>
                <h4>Total Applications</h4>
                <h2>{stats.totalApplications}</h2>
              </div>
            </div>
          </>
        )}

        {/* NGO */}
        {role === "ngo" && (
          <div className="ngo-dashboard">
            {/* ===== TOP STATS ===== */}
            <div className="ngo-stats-grid">
              <div className="ngo-card blue">
                <div className="card-top">
                  <FaLeaf className="card-icon" />
                  <h4>Total Opportunities</h4>
                </div>
                <h2>{stats.totalOpportunities || 0}</h2>
              </div>

              <div className="ngo-card green">
                <div className="card-top">
                  <FaCheckCircle className="card-icon" />
                  <h4>Active Opportunities</h4>
                </div>
                <h2>{stats.activeOpportunities || 0}</h2>
              </div>

              <div className="ngo-card yellow">
                <div className="card-top">
                  <FaClipboardList className="card-icon" />
                  <h4>Total Applications</h4>
                </div>
                <h2>{stats.totalApplications || 0}</h2>
              </div>

              <div className="ngo-card teal">
                <div className="card-top">
                  <FaTasks className="card-icon" />
                  <h4>Completed Projects</h4>
                </div>
                <h2>{stats.completedProjects || 0}</h2>
              </div>
            </div>

            {/* ===== RECENT APPLICATIONS ===== */}
            <div className="ngo-table-section">
              <h3>Recent Applications</h3>

              {stats.recentApplications?.map((app) => (
                <div key={app._id} className="ngo-table-row">
                  <div>
                    
                    {app.opportunity_id?.title}
                    </div>
                  <div>{app.volunteer_id?.name}</div>
                  <div>{new Date(app.createdAt).toLocaleDateString()}</div>

                  <div className={`status ${app.status}`}>{app.status}</div>

                  {app.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="accept-btn"
                        onClick={() => updateStatus(app._id, "accepted")}
                      >
                        Accept
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => updateStatus(app._id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="ngo-chart-section">
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
        )}
        {/* VOLUNTEER */}
        {role === "volunteer" && (
          <>
            <div className="admin-card">
              <div className="card-icon opportunities">
                <FaLeaf />
              </div>
              <div>
                <h4>Available Opportunities</h4>
                <h2>{stats.totalOpen}</h2>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-icon users">
                <FaClipboardList />
              </div>
              <div>
                <h4>My Applications</h4>
                <h2>{stats.totalApplied}</h2>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-icon applications">
                <FaUsers />
              </div>
              <div>
                <h4>Accepted</h4>
                <h2>{stats.accepted}</h2>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-icon users">
                <FaUsers />
              </div>
              <div>
                <h4>Pending</h4>
                <h2>{stats.pending}</h2>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
import { useEffect, useState } from "react";
import { getDashboard, getReports, getLogs } from "../service/AdminDashboard";
import StatCard from "../components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});cd
  const [reports, setReports] = useState({});
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const dashboard = await getDashboard(token);
    const report = await getReports(token);
    const adminLogs = await getLogs(token);

    setStats(dashboard.data);
    setReports(report.data);
    setLogs(adminLogs.data);
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Opportunities" value={stats.totalOpportunities} />
        <StatCard title="Applications" value={stats.totalApplications} />
        <StatCard title="Active Opportunities" value={stats.activeOpportunities} />
      </div>

      {/* Charts */}
      <div className="charts">
        <h2>Users By Role</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reports.usersByRole}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>

        <h2>Opportunities By Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reports.opportunitiesByStatus}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Admin Logs */}
      <div className="logs-section">
        <h2>Admin Activity Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.action}</td>
                <td>{log.user_id?.email || "System"}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

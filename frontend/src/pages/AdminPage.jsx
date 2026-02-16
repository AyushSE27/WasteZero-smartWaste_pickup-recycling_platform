import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AdminPage = () => {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("users");
  const [query, setQuery] = useState("");

  const load = async () => {
    const [r, u, l] = await Promise.all([api.get("/admin/report"), api.get("/users"), api.get("/admin/logs")]);
    setReport(r.data.report);
    setUsers(u.data.users || []);
    setLogs(l.data.logs || []);
  };

  useEffect(() => {
    load();
  }, []);

  const suspend = async (id) => {
    await api.patch(`/users/${id}/suspend`);
    load();
  };

  const downloadReport = (type) => {
    const blob = new Blob([JSON.stringify({ type, report }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wastezero-${type}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(
    () => users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  return (
    <section>
      <header className="page-head">
        <h1>Admin Dashboard</h1>
        <p>Manage platform users, monitor activity, and generate reports</p>
      </header>

      {report && (
        <div className="stats-grid">
          <article className="card stat-card">
            <h4>Total Users</h4>
            <strong>{report.totals.users}</strong>
          </article>
          <article className="card stat-card">
            <h4>Completed Pickups</h4>
            <strong>{report.pickupStats.completed || 0}</strong>
          </article>
          <article className="card stat-card">
            <h4>Pending Pickups</h4>
            <strong>{report.pickupStats.scheduled || 0}</strong>
          </article>
          <article className="card stat-card">
            <h4>Active Opportunities</h4>
            <strong>{report.totals.openOpportunities || 0}</strong>
          </article>
        </div>
      )}

      <div className="card">
        <h2>Generate Reports</h2>
        <p className="small">Download platform statistics and activity reports</p>
        <div className="actions-row">
          <button className="secondary-btn" onClick={() => downloadReport("users")}>
            Users Report
          </button>
          <button className="secondary-btn" onClick={() => downloadReport("pickups")}>
            Pickups Report
          </button>
          <button className="secondary-btn" onClick={() => downloadReport("opportunities")}>
            Opportunities Report
          </button>
          <button className="secondary-btn" onClick={() => downloadReport("activity")}>
            Full Activity Report
          </button>
        </div>
      </div>

      <div className="tab-switch">
        <button className={tab === "users" ? "active-tab" : ""} onClick={() => setTab("users")}>Manage Users</button>
        <button className={tab === "logs" ? "active-tab" : ""} onClick={() => setTab("logs")}>Admin Logs</button>
      </div>

      {tab === "users" ? (
        <div className="card">
          <h2>Users</h2>
          <p className="small">Manage user accounts and permissions</p>
          <input placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="list">
            {filteredUsers.map((u) => (
              <div key={u.id} className="list-item row-between">
                <p>
                  <strong>{u.name}</strong> ({u.role}) - {u.email} {u.suspended ? "[SUSPENDED]" : ""}
                </p>
                {!u.suspended && u.role !== "admin" && (
                  <button className="danger-btn" onClick={() => suspend(u.id)}>
                    Suspend
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>Admin Logs</h2>
          <div className="list">
            {logs.map((l) => (
              <div key={l.id} className="list-item">
                <p>
                  {l.timestamp}: {l.action}
                </p>
              </div>
            ))}
            {!logs.length && <p className="small">No admin logs yet.</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPage;

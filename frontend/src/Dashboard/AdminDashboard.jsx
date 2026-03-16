import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaFileDownload,
  FaClipboardList,
  FaUserShield,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import "./AdminDashboard.css";

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWastePickupRequests: 0,
    pendingPickups: 0,
    completedPickups: 0,
    activePickupAgents: 0,
    analytics: {
      requestsOverTime: [],
      wasteTypeDistribution: [],
      pickupStatusDistribution: [],
    },
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [pickupRows, setPickupRows] = useState([]);
  const [pickupSearch, setPickupSearch] = useState("");
  const [pickupStatusFilter, setPickupStatusFilter] = useState("all");
  const [pickupSort, setPickupSort] = useState("newest");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const token = localStorage.getItem("token");

  // ✅ DEFINE FUNCTIONS FIRST

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats", {
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

  const fetchActivityLogs = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/activity-logs?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setActivityLogs(res.data || []);
  };

  const fetchPickupRequests = async () => {
    const params = new URLSearchParams();
    if (pickupSearch.trim()) params.set("q", pickupSearch.trim());
    if (pickupStatusFilter !== "all") params.set("status", pickupStatusFilter);
    params.set("sort", pickupSort);

    const res = await axios.get(
      `http://localhost:5000/api/admin/pickup-requests?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setPickupRows(res.data || []);
  };

  const downloadCsv = ({ filename, rows, headers }) => {
    const escape = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
      return s;
    };

    const csv = [
      headers.map((h) => escape(h)).join(","),
      ...rows.map((r) => r.map((c) => escape(c)).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleUsersReport = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data || [];

    downloadCsv({
      filename: `wastezero-users-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: ["User ID", "Name", "Email", "Phone", "Role", "Account Status", "Created At"],
      rows: data.map((u) => [
        u._id,
        u.name,
        u.email,
        u.phone || "",
        u.role,
        u.accountStatus || (u.isBlocked ? "blocked" : "active"),
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
      ]),
    });
  };

  const handlePickupsReport = async () => {
    const params = new URLSearchParams();
    params.set("sort", "newest");
    const res = await axios.get(
      `http://localhost:5000/api/admin/pickup-requests?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = res.data || [];

    downloadCsv({
      filename: `wastezero-pickups-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        "Request ID",
        "User Name",
        "Waste Type",
        "Pickup Location",
        "Assigned Agent",
        "Pickup Status",
        "Created At",
      ],
      rows: data.map((p) => [
        p.requestId,
        p.userName,
        p.wasteType,
        p.pickupLocation,
        p.assignedAgent ? String(p.assignedAgent) : "",
        p.pickupStatus,
        p.createdAt ? new Date(p.createdAt).toISOString() : "",
      ]),
    });
  };

  const handleOpportunitiesReport = async () => {
    const res = await axios.get("http://localhost:5000/api/opportunities", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data || [];

    downloadCsv({
      filename: `wastezero-opportunities-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: ["Opportunity ID", "Title", "NGO", "Location", "Status", "Date", "Created At"],
      rows: data.map((o) => [
        o._id,
        o.title,
        o.ngo_id?.name || "",
        o.location || "",
        o.status || "",
        o.date ? new Date(o.date).toISOString() : "",
        o.createdAt ? new Date(o.createdAt).toISOString() : "",
      ]),
    });
  };

  const handleActivityReport = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/activity-logs?limit=5000", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data || [];

    downloadCsv({
      filename: `wastezero-activity-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: ["Type", "Description", "User", "Request ID", "Timestamp"],
      rows: data.map((a) => [
        a.type,
        a.description,
        a.userName || "",
        a.requestId || "",
        a.createdAt ? new Date(a.createdAt).toISOString() : "",
      ]),
    });
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };


  const openEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  };

  const saveUserEdits = async () => {
    if (!editingUser?._id) return;
    await axios.put(
      `http://localhost:5000/api/admin/users/${editingUser._id}/edit`,
      editForm,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setEditingUser(null);
    fetchUsers();
    fetchActivityLogs();
  };

  const toggleSuspend = async (id) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
    fetchActivityLogs();
  };

  const toggleBlockV2 = async (id) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
    fetchActivityLogs();
  };

  // ✅ NOW useEffect AFTER FUNCTIONS

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchActivityLogs();
    fetchPickupRequests();
  }, []);

  useEffect(() => {
    fetchPickupRequests();
  }, [pickupSearch, pickupStatusFilter, pickupSort]);

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

  const getAccountStatus = (user) => {
    if (user.accountStatus) return user.accountStatus;
    if (user.isBlocked) return "blocked";
    return "active";
  };

  const wasteColors = {
    plastic: "#4f46e5",
    paper: "#10b981",
    metal: "#f59e0b",
    organic: "#22c55e",
    other: "#94a3b8",
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
          <h2>{stats.totalUsers ?? 0}</h2>
        </div>

        <div className="admin-stat-card gradient-teal">
          <FaClipboardList />
          <h4>Total Waste Pickup Requests</h4>
          <h2>{stats.totalWastePickupRequests ?? 0}</h2>
        </div>

        <div className="admin-stat-card gradient-green">
          <FaCheckCircle />
          <h4>Completed Pickups</h4>
          <h2>{stats.completedPickups ?? 0}</h2>
        </div>

        <div className="admin-stat-card gradient-orange">
          <FaClock />
          <h4>Pending Pickups</h4>
          <h2>{stats.pendingPickups ?? 0}</h2>
        </div>

        <div className="admin-stat-card gradient-purple">
          <FaUserShield />
          <h4>Active Pickup Agents</h4>
          <h2>{stats.activePickupAgents ?? 0}</h2>
        </div>
      </div>

      {/* ================= ANALYTICS + ACTIVITY ================= */}
      <div className="admin-analytics-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Dashboard Analytics</h3>
            <p>Last 30 days and overall distributions</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h4>Waste Pickup Requests Over Time</h4>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.analytics?.requestsOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2d89ef" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h4>Waste Type Distribution</h4>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={(stats.analytics?.wasteTypeDistribution || []).map((d) => ({
                        ...d,
                        name: (d.type || "").charAt(0).toUpperCase() + (d.type || "").slice(1),
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {(stats.analytics?.wasteTypeDistribution || []).map((d, idx) => (
                        <Cell key={`${d.type}-${idx}`} fill={wasteColors[d.type] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h4>Pickup Status Distribution</h4>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.analytics?.pickupStatusDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8e2de2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Activity</h3>
            <p>Latest 10 platform actions</p>
          </div>

          <div className="activity-feed">
            {activityLogs.length === 0 ? (
              <div className="empty-state">No recent activity yet.</div>
            ) : (
              activityLogs.map((a) => (
                <div key={a._id} className="activity-item">
                  <div className="activity-main">
                    <div className="activity-desc">{a.description}</div>
                    <div className="activity-meta">
                      <span className="activity-user">{a.userName || "—"}</span>
                      {a.requestId ? (
                        <span className="activity-req">Request: {a.requestId}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="activity-time">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= REPORTS ================= */}
      <div className="admin-report-section">
        <div className="report-header">
          <h3>Generate Reports</h3>
          <p>Download platform analytics and system reports</p>
        </div>

        <div className="report-buttons">
          <button className="report-btn" onClick={handleUsersReport}>
            <FaFileDownload /> Users Report
          </button>

          <button className="report-btn" onClick={handlePickupsReport}>
            <FaFileDownload /> Pickups Report
          </button>

          <button className="report-btn" onClick={handleOpportunitiesReport}>
            <FaFileDownload /> Opportunities Report
          </button>

          <button className="report-btn primary" onClick={handleActivityReport}>
            <FaFileDownload /> Full Activity Report
          </button>
        </div>
      </div>

      {/* ================= PICKUP REQUESTS ================= */}
      <div className="admin-manage-section">
        <h3>Pickup Requests</h3>
        <div className="user-controls">
          <input
            type="text"
            placeholder="Search by user name or request ID..."
            value={pickupSearch}
            onChange={(e) => setPickupSearch(e.target.value)}
          />
          <select
            value={pickupStatusFilter}
            onChange={(e) => setPickupStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
          <select value={pickupSort} onChange={(e) => setPickupSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div className="user-table pickup-table">
          <div className="user-table-row header pickup-header">
            <div>Request ID</div>
            <div>User Name</div>
            <div>Waste Type</div>
            <div>Pickup Location</div>
            <div>Assigned Agent</div>
            <div>Status</div>
          </div>

          {pickupRows.map((r) => (
            <div key={r._id} className="user-table-row pickup-row">
              <div className="mono">{r.requestId}</div>
              <div>{r.userName}</div>
              <div>{r.wasteType}</div>
              <div className="truncate">{r.pickupLocation}</div>
              <div>{r.assignedAgent ? String(r.assignedAgent) : "—"}</div>
              <div>
                <span className={`pill-badge status-${r.pickupStatus}`}>
                  {r.pickupStatus}
                </span>
              </div>
            </div>
          ))}

          {pickupRows.length === 0 ? (
            <div className="empty-state">No pickup requests match your filters.</div>
          ) : null}
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
            <div>User ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filteredUsers.map((user) => (
            <div key={user._id} className="user-table-row">
              <div className="mono">{user._id}</div>
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{user.phone || "—"}</div>
              <div className="user-actions">
                <div>
                  <span
                    className={`status-badge ${
                      getAccountStatus(user) === "blocked"
                        ? "blocked"
                        : getAccountStatus(user) === "suspended"
                          ? "suspended"
                          : "active"
                    }`}
                  >
                    {getAccountStatus(user) === "blocked"
                      ? "Blocked"
                      : getAccountStatus(user) === "suspended"
                        ? "Suspended"
                        : "Active"}
                  </span>
                </div>

                <button className="edit-btn" onClick={() => openEditUser(user)}>
                  Edit
                </button>

                <button
                  className={`suspend-btn ${
                    getAccountStatus(user) === "suspended" ? "unsuspend" : "suspend"
                  }`}
                  onClick={() => toggleSuspend(user._id)}
                >
                  {getAccountStatus(user) === "suspended" ? "Unsuspend" : "Suspend"}
                </button>

                <button
                  className={`block-btn ${
                    getAccountStatus(user) === "blocked" ? "unblock" : "block"
                  }`}
                  onClick={() => toggleBlockV2(user._id)}
                >
                  {getAccountStatus(user) === "blocked" ? "Unblock" : "Block"}
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

      {editingUser ? (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="report-btn" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button className="report-btn primary" onClick={saveUserEdits}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPanel;

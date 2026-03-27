import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaFileDownload,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminActivityItem from "./admin/AdminActivityItem";
import AdminDataTable from "./admin/AdminDataTable";
import AdminSection from "./admin/AdminSection";
import AdminStatCard from "./admin/AdminStatCard";
import "./AdminDashboard.css";

const KPI_CONFIG = [
  {
    key: "totalUsers",
    title: "Total Users",
    icon: FaUsers,
    tone: "blue",
    accent: "linear-gradient(135deg, #3182ce, #63b3ed)",
  },
  {
    key: "totalWastePickupRequests",
    title: "Pickup Requests",
    icon: FaClipboardList,
    tone: "teal",
    accent: "linear-gradient(135deg, #0f9b8e, #38b2ac)",
  },
  {
    key: "completedPickups",
    title: "Completed Pickups",
    icon: FaCheckCircle,
    tone: "green",
    accent: "linear-gradient(135deg, #2f855a, #68d391)",
  },
  {
    key: "pendingPickups",
    title: "Pending Pickups",
    icon: FaClock,
    tone: "orange",
    accent: "linear-gradient(135deg, #dd6b20, #f6ad55)",
  },
  {
    key: "activePickupAgents",
    title: "Active Agents",
    icon: FaUserShield,
    tone: "purple",
    accent: "linear-gradient(135deg, #6b46c1, #9f7aea)",
  },
];

const PICKUP_COLUMNS = [
  { key: "requestId", label: "Request ID", className: "mono-cell" },
  { key: "userName", label: "User" },
  { key: "wasteType", label: "Waste Type" },
  { key: "pickupLocation", label: "Pickup Location", className: "truncate-cell" },
  { key: "assignedAgent", label: "Assigned Agent" },
  { key: "pickupStatus", label: "Status" },
];

const USER_COLUMNS = [
  { key: "_id", label: "User ID", className: "mono-cell" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const WasteLegend = ({ payload = [] }) => {
  return (
    <div className="waste-legend">
      {payload.map((entry) => (
        <div
          key={`${entry.payload?.name || entry.value}-${entry.color}`}
          className="waste-legend-item"
        >
          <span
            className="waste-legend-swatch"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.payload?.name || entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
  const adminName = localStorage.getItem("name") || "Admin";

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
    const escape = (value) => {
      if (value === null || value === undefined) return "";
      const text = String(value);
      if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
      return text;
    };

    const csv = [
      headers.map((header) => escape(header)).join(","),
      ...rows.map((row) => row.map((cell) => escape(cell)).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
      rows: data.map((user) => [
        user._id,
        user.name,
        user.email,
        user.phone || "",
        user.role,
        user.accountStatus || (user.isBlocked ? "blocked" : "active"),
        user.createdAt ? new Date(user.createdAt).toISOString() : "",
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
      rows: data.map((pickup) => [
        pickup.requestId,
        pickup.userName,
        pickup.wasteType,
        pickup.pickupLocation,
        pickup.assignedAgent ? String(pickup.assignedAgent) : "",
        pickup.pickupStatus,
        pickup.createdAt ? new Date(pickup.createdAt).toISOString() : "",
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
      rows: data.map((opportunity) => [
        opportunity._id,
        opportunity.title,
        opportunity.ngo_id?.name || "",
        opportunity.location || "",
        opportunity.status || "",
        opportunity.date ? new Date(opportunity.date).toISOString() : "",
        opportunity.createdAt ? new Date(opportunity.createdAt).toISOString() : "",
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
      rows: data.map((activity) => [
        activity.type,
        activity.description,
        activity.userName || "",
        activity.requestId || "",
        activity.createdAt ? new Date(activity.createdAt).toISOString() : "",
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

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchActivityLogs();
    fetchPickupRequests();
  }, []);

  useEffect(() => {
    fetchPickupRequests();
  }, [pickupSearch, pickupStatusFilter, pickupSort]);

  const getAccountStatus = (user) => {
    if (user.accountStatus) return user.accountStatus;
    if (user.isBlocked) return "blocked";
    return "active";
  };

  const filteredUsers = useMemo(() => {
    if (searchTerm.trim()) {
      return users.filter((user) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    }

    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [searchTerm, users]);

  const activeAgents = useMemo(
    () =>
      users
        .filter(
          (user) =>
            user.role === "volunteer" &&
            getAccountStatus(user) === "active",
        )
        .slice(0, 6),
    [users],
  );

  const wasteColors = {
    plastic: "#4f46e5",
    paper: "#10b981",
    metal: "#f59e0b",
    organic: "#22c55e",
    other: "#94a3b8",
  };

  const statCards = KPI_CONFIG.map((item) => ({
    ...item,
    value: stats[item.key] ?? 0,
  }));

  return (
    <div className="admin-workspace">
      <div className="admin-workspace-main">
        <header className="admin-hero" id="overview">
          <div>
            <span className="admin-eyebrow">Admin Control Center</span>
            <h1>WasteZero Operations Dashboard</h1>
            <p>
              Monitor pickups, manage users, review recent activity, and export
              operational reports from one clean workspace.
            </p>
          </div>

          <div className="admin-profile-chip">
            <span>{adminName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{adminName}</strong>
              <small>Platform Administrator</small>
            </div>
          </div>
        </header>

        <section className="admin-kpi-grid">
          {statCards.map((card) => (
            <AdminStatCard key={card.key} {...card} />
          ))}
        </section>

        <AdminSection
          title="Dashboard Analytics"
          eyebrow="Analytics"
          description="Last 30 days and overall waste distribution trends."
        >
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
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h4>Waste Type Distribution</h4>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={(stats.analytics?.wasteTypeDistribution || []).map((item) => ({
                        ...item,
                        name:
                          (item.type || "").charAt(0).toUpperCase() +
                          (item.type || "").slice(1),
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={84}
                      label
                    >
                      {(stats.analytics?.wasteTypeDistribution || []).map((item, index) => (
                        <Cell
                          key={`${item.type}-${index}`}
                          fill={wasteColors[item.type] || "#64748b"}
                        />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        content={<WasteLegend />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card chart-card-wide">
              <h4>Pickup Status Distribution</h4>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.analytics?.pickupStatusDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#7c3aed"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </AdminSection>

        <AdminSection
          title="Recent Activity"
          eyebrow="Activity"
          description="Latest platform actions with request context and timestamps."
        >
          <div className="activity-feed">
            {activityLogs.length === 0 ? (
              <div className="admin-empty-state">
                No recent activity yet.
              </div>
            ) : (
              activityLogs.map((activity) => (
                <AdminActivityItem key={activity._id} activity={activity} />
              ))
            )}
          </div>
        </AdminSection>

        <AdminSection
          title="Generate Reports"
          eyebrow="Exports"
          description="Download clean CSV exports for audits, reviews, and reporting."
          actions={
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
          }
        />

        <AdminSection
          id="pickup-requests"
          title="Pickup Requests"
          eyebrow="Operations"
          description="Search, filter, and review every pickup request without clutter."
          actions={
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="Search by user name or request ID..."
                value={pickupSearch}
                onChange={(event) => setPickupSearch(event.target.value)}
              />
              <select
                value={pickupStatusFilter}
                onChange={(event) => setPickupStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={pickupSort}
                onChange={(event) => setPickupSort(event.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          }
        >
          <AdminDataTable
            columns={PICKUP_COLUMNS}
            rows={pickupRows}
            emptyMessage="No pickup requests match your filters."
            className="pickup-table"
            renderRow={(row, index) => (
              <div
                key={row._id}
                className={`admin-data-row ${index % 2 === 0 ? "row-even" : "row-odd"}`}
              >
                <div className="mono-cell">{row.requestId}</div>
                <div>{row.userName}</div>
                <div>{row.wasteType}</div>
                <div className="truncate-cell">{row.pickupLocation}</div>
                <div>{row.assignedAgent ? String(row.assignedAgent) : "-"}</div>
                <div>
                  <span className={`pill-badge status-${row.pickupStatus}`}>
                    {row.pickupStatus}
                  </span>
                </div>
              </div>
            )}
          />
        </AdminSection>

        <AdminSection
          id="users"
          title="Users"
          eyebrow="People"
          description="Search and manage user access with cleaner row actions and clear status badges."
          actions={
            <div className="admin-toolbar admin-toolbar-compact">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          }
        >
          <AdminDataTable
            columns={USER_COLUMNS}
            rows={filteredUsers}
            emptyMessage="No users found for the current search."
            className="users-table"
            renderRow={(user, index) => {
              const accountStatus = getAccountStatus(user);

              return (
                <div
                  key={user._id}
                  className={`admin-data-row ${index % 2 === 0 ? "row-even" : "row-odd"}`}
                >
                  <div className="mono-cell">{user._id}</div>
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.phone || "-"}</div>
                  <div>
                    <span className={`status-badge ${accountStatus}`}>
                      {accountStatus === "blocked"
                        ? "Blocked"
                        : accountStatus === "suspended"
                          ? "Suspended"
                          : "Active"}
                    </span>
                  </div>
                  <div className="user-actions">
                    <button className="edit-btn" onClick={() => openEditUser(user)}>
                      Edit
                    </button>
                    <button
                      className={`suspend-btn ${accountStatus === "suspended" ? "unsuspend" : "suspend"}`}
                      onClick={() => toggleSuspend(user._id)}
                    >
                      {accountStatus === "suspended" ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      className={`block-btn ${accountStatus === "blocked" ? "unblock" : "block"}`}
                      onClick={() => toggleBlockV2(user._id)}
                    >
                      {accountStatus === "blocked" ? "Unblock" : "Block"}
                    </button>
                    <button className="delete-btn" onClick={() => deleteUser(user._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </AdminSection>

        <AdminSection
          id="agents"
          title="Agents"
          eyebrow="Snapshot"
          description="Quick view of active pickup agents surfaced from the current user data."
        >
          <div className="agent-list">
            {activeAgents.length === 0 ? (
              <div className="admin-empty-state">No active agents available.</div>
            ) : (
              activeAgents.map((agent) => (
                <article key={agent._id} className="agent-card">
                  <div className="agent-avatar">
                    {agent.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <strong>{agent.name}</strong>
                    <p>{agent.email}</p>
                  </div>
                  <span className="status-badge active">Active</span>
                </article>
              ))
            )}
          </div>
        </AdminSection>

        {editingUser ? (
          <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
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
                    onChange={(event) =>
                      setEditForm({ ...editForm, name: event.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm({ ...editForm, email: event.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Phone</label>
                  <input
                    value={editForm.phone}
                    onChange={(event) =>
                      setEditForm({ ...editForm, phone: event.target.value })
                    }
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
    </div>
  );
};

export default AdminPanel;

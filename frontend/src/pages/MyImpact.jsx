import { useEffect, useState } from "react";
import "./MyImpact.css";

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

const MyImpact = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalPickups: 0,
    totalWaste: 0,
    opportunitiesJoined: 0,
    co2Saved: 0,
    treesEquivalent: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        // Fetch pickups
        const pickupRes = await fetch(`${API}/pickups`, { headers: authHeaders });
        const pickups = pickupRes.ok ? await pickupRes.json() : [];

        // Fetch applications (opportunities joined)
        const appRes = await fetch(`${API}/applications/my`, { headers: authHeaders });
        const applications = appRes.ok ? await appRes.json() : [];

        // Calculate stats
        const completedPickups = Array.isArray(pickups)
          ? pickups.filter((p) => p.status === "completed" || p.status === "Completed")
          : [];

        const totalWasteKg = completedPickups.reduce(
          (sum, p) => sum + (parseFloat(p.wasteAmount) || parseFloat(p.weight) || 2),
          0
        );

        const co2 = totalWasteKg * 2.5;
        const trees = Math.floor(co2 / 21);

        setStats({
          totalPickups: completedPickups.length || pickups.length || 0,
          totalWaste: totalWasteKg.toFixed(1),
          opportunitiesJoined: Array.isArray(applications) ? applications.length : 0,
          co2Saved: co2.toFixed(1),
          treesEquivalent: trees,
        });

        // Build recent activity from pickups
        const activity = Array.isArray(pickups)
          ? pickups.slice(0, 5).map((p) => ({
              id: p._id,
              type: "pickup",
              title: `Waste Pickup - ${p.wasteType || p.category || "General"}`,
              date: p.scheduledDate || p.createdAt,
              status: p.status || "scheduled",
              icon: "🗑️",
            }))
          : [];

        // Add applications to activity
        if (Array.isArray(applications)) {
          applications.slice(0, 3).forEach((a) => {
            activity.push({
              id: a._id,
              type: "opportunity",
              title: `Applied: ${a.opportunity?.title || "Opportunity"}`,
              date: a.createdAt,
              status: a.status || "pending",
              icon: "🌱",
            });
          });
        }

        // Sort by date
        activity.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(activity.slice(0, 6));
      } catch (err) {
        console.error("Failed to load impact data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "status-completed";
      case "approved": return "status-approved";
      case "pending": return "status-pending";
      case "scheduled": return "status-scheduled";
      default: return "status-default";
    }
  };

  const statCards = [
    {
      icon: "🗑️",
      label: "Pickups Completed",
      value: stats.totalPickups,
      unit: "",
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      icon: "⚖️",
      label: "Waste Collected",
      value: stats.totalWaste,
      unit: "kg",
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      icon: "🌍",
      label: "CO₂ Saved",
      value: stats.co2Saved,
      unit: "kg",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      icon: "🌱",
      label: "Opportunities Joined",
      value: stats.opportunitiesJoined,
      unit: "",
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      icon: "🌳",
      label: "Trees Equivalent",
      value: stats.treesEquivalent,
      unit: "",
      color: "#059669",
      bg: "#ecfdf5",
    },
  ];

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="spinner" />
        <p>Loading your impact...</p>
      </div>
    );
  }

  return (
    <div className="impact-page">
      {/* Header */}
      <div className="impact-header">
        <div>
          <h1>My Impact</h1>
          <p>Track your environmental contributions and achievements</p>
        </div>
        <div className="impact-user-badge">
          <div className="impact-avatar">
            {(user?.name || user?.username || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="impact-username">{user?.name || user?.username}</div>
            <div className="impact-role">{user?.role || "Volunteer"}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ "--accent": card.color, "--bg": card.bg }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">
              {card.value}
              {card.unit && <span className="stat-unit">{card.unit}</span>}
            </div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Impact Summary Banner */}
      <div className="impact-banner">
        <div className="banner-content">
          <span className="banner-icon">🏆</span>
          <div>
            <h3>Great work, {user?.name?.split(" ")[0] || "Volunteer"}!</h3>
            <p>
              You've helped collect <strong>{stats.totalWaste} kg</strong> of waste,
              saving <strong>{stats.co2Saved} kg</strong> of CO₂ — equivalent to planting{" "}
              <strong>{stats.treesEquivalent} trees</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="no-activity">
            <span>🌿</span>
            <p>No activity yet. Schedule a pickup or join an opportunity to get started!</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">{item.icon}</div>
                <div className="activity-info">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-date">{formatDate(item.date)}</div>
                </div>
                <span className={`activity-status ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyImpact;
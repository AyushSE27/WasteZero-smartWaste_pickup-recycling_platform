import { useState } from "react";
import "./Settings.css";

const API = "http://localhost:5000/api";

const Settings = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pickupReminders: true,
    opportunityAlerts: true,
    messageNotifications: true,
  });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAccountSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountForm),
      });

      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
        showMessage("Account updated successfully!");
      } else {
        showMessage("Failed to update account.", "error");
      }
    } catch (err) {
      showMessage("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        showMessage("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        showMessage(data.message || "Failed to change password.", "error");
      }
    } catch (err) {
      showMessage("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "password", label: "Password", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`toast ${message.type}`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="settings-card">
              <h2>Account Information</h2>
              <p className="card-desc">Update your name and email address</p>

              <div className="avatar-section">
                <div className="big-avatar">
                  {(user?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="avatar-name">{user?.name || "User"}</div>
                  <div className="avatar-role">{user?.role || "volunteer"}</div>
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={user?.role || "volunteer"}
                  disabled
                  className="disabled-input"
                />
                <span className="field-hint">Role cannot be changed</span>
              </div>

              <button className="save-btn" onClick={handleAccountSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="settings-card">
              <h2>Change Password</h2>
              <p className="card-desc">Keep your account secure with a strong password</p>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              {/* Password strength indicator */}
              {passwordForm.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill ${
                        passwordForm.newPassword.length < 6
                          ? "weak"
                          : passwordForm.newPassword.length < 10
                          ? "medium"
                          : "strong"
                      }`}
                    />
                  </div>
                  <span className="strength-label">
                    {passwordForm.newPassword.length < 6
                      ? "Weak"
                      : passwordForm.newPassword.length < 10
                      ? "Medium"
                      : "Strong"}
                  </span>
                </div>
              )}

              <button className="save-btn" onClick={handlePasswordSave} disabled={saving}>
                {saving ? "Saving..." : "Change Password"}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="settings-card">
              <h2>Notification Preferences</h2>
              <p className="card-desc">Choose what notifications you want to receive</p>

              {[
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "pickupReminders", label: "Pickup Reminders", desc: "Get reminded about scheduled pickups" },
                { key: "opportunityAlerts", label: "Opportunity Alerts", desc: "Be notified about new opportunities" },
                { key: "messageNotifications", label: "Message Notifications", desc: "Get notified when you receive messages" },
              ].map((item) => (
                <div key={item.key} className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">{item.label}</div>
                    <div className="toggle-desc">{item.desc}</div>
                  </div>
                  <button
                    className={`toggle-btn ${notifications[item.key] ? "on" : "off"}`}
                    onClick={() =>
                      setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              ))}

              <button
                className="save-btn"
                onClick={() => showMessage("Notification preferences saved!")}
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
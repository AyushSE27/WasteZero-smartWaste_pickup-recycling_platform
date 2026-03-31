import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCloudDownloadAlt,
  FaCog,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTrashAlt,
  FaUserEdit,
  FaUserLock,
} from "react-icons/fa";
import SettingsSection from "../components/settings/SettingsSection";
import ToggleSwitch from "../components/settings/ToggleSwitch";
import ActionButton from "../components/settings/ActionButton";
import ConfirmationModal from "../components/settings/ConfirmationModal";
import AvatarUpload from "../components/settings/AvatarUpload";
import {
  deleteUserAccount,
  exportUserData,
  getUserSettings,
  updateUserLocation,
  updateUserPreferences,
  uploadUserAvatar,
} from "../services/userService";
import "./settings.css";

const API_BASE_URL = "http://localhost:5000";

const applyTheme = (isDark) => {
  document.body.className = isDark ? "dark" : "";
  localStorage.setItem("theme", isDark ? "dark" : "light");
  window.dispatchEvent(
    new CustomEvent("wastezero-theme-change", {
      detail: { darkMode: isDark },
    }),
  );
};

const toTitleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "User";

const createCsvContent = (rows) => {
  const headers = [
    "Pickup ID",
    "Address",
    "City",
    "Date",
    "Time Slot",
    "Waste Types",
    "Status",
    "Notes",
    "Created At",
  ];

  const escapedRows = rows.map((pickup) => [
    pickup.pickupId || "",
    pickup.address || "",
    pickup.city || "",
    pickup.date ? new Date(pickup.date).toLocaleDateString() : "",
    pickup.timeSlot || "",
    Array.isArray(pickup.wasteTypes) ? pickup.wasteTypes.join(", ") : "",
    pickup.status || "",
    pickup.notes || "",
    pickup.createdAt ? new Date(pickup.createdAt).toLocaleString() : "",
  ]);

  return [headers, ...escapedRows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
};

const Settings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [settingsData, setSettingsData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    accountStatus: "active",
    avatar: "",
    defaultPickupLocation: "",
    preferences: {
      emailNotifications: true,
      pickupUpdates: true,
      reminderAlerts: true,
    },
  });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [savingPreferenceKey, setSavingPreferenceKey] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getUserSettings(token);
        setSettingsData(response.data);
        setLocationInput(response.data.defaultPickupLocation || "");
      } catch (error) {
        setFeedback({
          type: "error",
          text: error.response?.data?.message || "Unable to load your settings right now.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  useEffect(() => {
    if (selectedAvatarFile) {
      const objectUrl = URL.createObjectURL(selectedAvatarFile);
      setAvatarPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (!settingsData.avatar) {
      setAvatarPreviewUrl("");
      return undefined;
    }

    setAvatarPreviewUrl(
      settingsData.avatar.startsWith("http")
        ? settingsData.avatar
        : `${API_BASE_URL}${settingsData.avatar}`,
    );

    return undefined;
  }, [selectedAvatarFile, settingsData.avatar]);

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
  };

  const handlePreferenceToggle = async (key, nextValue) => {
    const previousPreferences = settingsData.preferences;
    const updatedPreferences = {
      ...previousPreferences,
      [key]: nextValue,
    };

    setSettingsData((current) => ({
      ...current,
      preferences: updatedPreferences,
    }));
    setSavingPreferenceKey(key);

    try {
      await updateUserPreferences(updatedPreferences, token);
      showFeedback("success", "Preferences updated successfully.");
    } catch (error) {
      setSettingsData((current) => ({
        ...current,
        preferences: previousPreferences,
      }));
      showFeedback(
        "error",
        error.response?.data?.message || "Could not save your preferences.",
      );
    } finally {
      setSavingPreferenceKey("");
    }
  };

  const handleDarkModeToggle = (enabled) => {
    setDarkMode(enabled);
    applyTheme(enabled);
    showFeedback("success", `${enabled ? "Dark" : "Light"} mode preference saved.`);
  };

  const handleLocationSave = async () => {
    if (!locationInput.trim()) {
      showFeedback("error", "Please enter a default pickup location first.");
      return;
    }

    setIsSavingLocation(true);

    try {
      const response = await updateUserLocation(
        { defaultPickupLocation: locationInput.trim() },
        token,
      );
      setSettingsData((current) => ({
        ...current,
        defaultPickupLocation: response.data.defaultPickupLocation,
      }));
      setLocationInput(response.data.defaultPickupLocation);
      showFeedback("success", "Default pickup location updated.");
    } catch (error) {
      showFeedback(
        "error",
        error.response?.data?.message || "Could not update your default pickup location.",
      );
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedAvatarFile);
    setIsUploadingAvatar(true);

    try {
      const response = await uploadUserAvatar(formData, token);
      setSettingsData((current) => ({
        ...current,
        avatar: response.data.avatar,
      }));
      setSelectedAvatarFile(null);
      showFeedback("success", "Profile picture updated successfully.");
    } catch (error) {
      showFeedback(
        "error",
        error.response?.data?.message || "Could not upload your profile picture.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const response = await exportUserData(token);
      const csvContent = createCsvContent(response.data.pickups || []);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.setAttribute("download", "wastezero-pickup-history.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showFeedback("success", "Pickup history downloaded successfully.");
    } catch (error) {
      showFeedback(
        "error",
        error.response?.data?.message || "Could not export your pickup history.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      await deleteUserAccount(token);
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      showFeedback(
        "error",
        error.response?.data?.message || "Could not delete your account.",
      );
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-hero">
          <div>
            <h1>Settings</h1>
            <p>Loading your account controls and preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-hero">
        <div>
          <span className="settings-kicker">Workspace Preferences</span>
          <h1>Settings</h1>
          <p>Manage your account, privacy controls, notifications, and visual preferences in one place.</p>
        </div>
        <div className="settings-hero-account">
          <span className={`account-status-pill is-${settingsData.accountStatus}`}>
            {toTitleCase(settingsData.accountStatus)}
          </span>
          <strong>{settingsData.name}</strong>
          <small>{settingsData.email}</small>
        </div>
      </div>

      {feedback ? (
        <div className={`settings-feedback is-${feedback.type}`}>
          {feedback.text}
        </div>
      ) : null}

      <div className="settings-grid">
        <div className="settings-main-column">
          <SettingsSection
            icon={<FaUserEdit />}
            title="Profile Management"
            description="Reuse your existing profile workspace for personal details and password updates."
          >
            <AvatarUpload
              avatarUrl={avatarPreviewUrl}
              userName={settingsData.name}
              selectedFile={selectedAvatarFile}
              onSelectFile={setSelectedAvatarFile}
              onUpload={handleAvatarUpload}
              uploading={isUploadingAvatar}
            />
            <div className="settings-actions-grid">
              <ActionButton
                icon="✏️"
                title="Edit Profile"
                description="Open your profile editor without duplicating forms."
                onClick={() => navigate("/profile?tab=edit")}
              />
              <ActionButton
                icon="🔐"
                title="Change Password"
                description="Jump directly to the password section in My Profile."
                onClick={() => navigate("/profile?tab=password")}
                variant="secondary"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<FaCog />}
            title="Preferences"
            description="Customize your notification flow, theme, and pickup defaults."
          >
            <div className="settings-preferences-list">
              <ToggleSwitch
                label="Dark Mode"
                description="Apply a darker dashboard theme that persists on this device."
                checked={darkMode}
                onChange={handleDarkModeToggle}
              />
              <ToggleSwitch
                label="Email Notifications"
                description="Receive email alerts about account activity and important updates."
                checked={settingsData.preferences.emailNotifications}
                onChange={(value) => handlePreferenceToggle("emailNotifications", value)}
                disabled={savingPreferenceKey === "emailNotifications"}
              />
              <ToggleSwitch
                label="Pickup Updates"
                description="Get notified when pickup requests move through their status flow."
                checked={settingsData.preferences.pickupUpdates}
                onChange={(value) => handlePreferenceToggle("pickupUpdates", value)}
                disabled={savingPreferenceKey === "pickupUpdates"}
              />
              <ToggleSwitch
                label="Reminder Alerts"
                description="Receive reminders before upcoming pickup windows and deadlines."
                checked={settingsData.preferences.reminderAlerts}
                onChange={(value) => handlePreferenceToggle("reminderAlerts", value)}
                disabled={savingPreferenceKey === "reminderAlerts"}
              />
            </div>

            <div className="settings-inline-form">
              <div className="settings-field">
                <label htmlFor="defaultPickupLocation">Default Pickup Location</label>
                <input
                  id="defaultPickupLocation"
                  type="text"
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Enter your preferred pickup address or area"
                />
                <small>This location can be reused as your default pickup preference.</small>
              </div>
              <button
                type="button"
                className="primary-btn compact-btn"
                onClick={handleLocationSave}
                disabled={isSavingLocation}
              >
                {isSavingLocation ? "Saving..." : "Save Location"}
              </button>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<FaShieldAlt />}
            title="Data & Privacy"
            description="Download your pickup history or review how your data is managed."
          >
            <ActionButton
              icon={<FaCloudDownloadAlt />}
              title="Download Pickup History"
              description="Export your pickup records as a CSV file."
              onClick={handleExportData}
              loading={isExporting}
            />
          </SettingsSection>

          <SettingsSection
            icon={<FaTrashAlt />}
            title="Danger Zone"
            description="Permanently delete your account and remove access to your WasteZero workspace."
            tone="danger"
          >
            <button
              type="button"
              className="danger-btn danger-btn-block"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </SettingsSection>
        </div>

        <div className="settings-side-column">
          <SettingsSection
            icon={<FaUserLock />}
            title="Account Info"
            description="Read-only account details sourced from your current profile."
          >
            <div className="account-info-grid">
              <div className="account-info-item">
                <span>Account Type</span>
                <strong>{toTitleCase(settingsData.role)}</strong>
              </div>
              <div className="account-info-item">
                <span>Account Status</span>
                <strong>{toTitleCase(settingsData.accountStatus)}</strong>
              </div>
              <div className="account-info-item">
                <span>Email Address</span>
                <strong>{settingsData.email}</strong>
              </div>
              <div className="account-info-item">
                <span>Phone</span>
                <strong>{settingsData.phone || "Not provided"}</strong>
              </div>
              <div className="account-info-item">
                <span>Pickup Default</span>
                <strong>{settingsData.defaultPickupLocation || "Not set yet"}</strong>
              </div>
            </div>
          </SettingsSection>

          <div className="settings-hint-card">
            <FaMapMarkerAlt />
            <div>
              <h4>Quick Tip</h4>
              <p>
                Save your default pickup location here, then use the profile editor if you want to update
                your broader public profile details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action will permanently remove your workspace data and cannot be undone."
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        loading={isDeletingAccount}
      />
    </div>
  );
};

export default Settings;

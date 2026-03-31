import { useEffect, useState } from "react";
import { getProfile, updateProfile, changePassword } from "../services/authService";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    location: "",
    skills: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  /* ================= Fetch Profile ================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile(token);
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || "",
        location: res.data.location || "",
        skills: res.data.skills?.join(", ") || "",
      });
    } catch (error) {
      console.log("Failed to load profile");
    }
  };

  /* ================= Update Profile ================= */
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async () => {
    try {
      await updateProfile(
        {
          name: profileData.name,
          location: profileData.location,
          skills: profileData.skills.split(",").map((s) => s.trim()),
        },
        token
      );

      setMessage("Profile updated successfully");
    } catch (error) {
      setMessage("Failed to update profile");
    }
  };

  /* ================= Change Password ================= */
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token
      );

      setMessage("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage("Failed to update password");
    }
  };

    return (
  <div className="profile-wrapper">
    <div className="profile-header">
      <h2>My Profile</h2>
      <p>Manage your account information and settings</p>
    </div>

    {/* Tabs */}
    <div className="profile-tabs">
      <button
        className={activeTab === "profile" ? "active" : ""}
        onClick={() => setActiveTab("profile")}
      >
        Profile
      </button>
      <button
        className={activeTab === "password" ? "active" : ""}
        onClick={() => setActiveTab("password")}
      >
        Password
      </button>
    </div>

    <div className="profile-card">

      {activeTab === "profile" && (
        <>
          <h3>Personal Information</h3>
          <p className="helper-text">
            Update your personal information and profile details
          </p>

          <div className="form-grid">

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
              />
              <small>This email is used for notifications.</small>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
              />
              <small>Helps match you with nearby opportunities.</small>
            </div>

            <div className="form-group full-width">
              <label>Skills</label>
              <input
                type="text"
                name="skills"
                value={profileData.skills}
                onChange={handleProfileChange}
                placeholder="e.g. teamwork, sustainability"
              />
            </div>

          </div>

          <button className="primary-btn" onClick={handleProfileSubmit}>
            Save Changes
          </button>
        </>
      )}

      {activeTab === "password" && (
        <>
          <h3>Change Password</h3>
          <p className="helper-text">
            Update your password to secure your account
          </p>

          <div className="form-grid">

            <div className="form-group full-width">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <small>Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

          </div>

          <button className="primary-btn" onClick={handlePasswordSubmit}>
            Change Password
          </button>
        </>
      )}

      {message && <div className="success-msg">{message}</div>}
    </div>
  </div>
);
};

export default Profile;
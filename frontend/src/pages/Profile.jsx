import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProfile, updateProfile, changePassword } from "../services/authService";

const Profile = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const profileHeadingRef = useRef(null);
  const passwordHeadingRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get("tab");

    if (requestedTab === "password") {
      setActiveTab("password");
      window.requestAnimationFrame(() => {
        passwordHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        passwordHeadingRef.current?.focus();
      });
      return;
    }

    if (requestedTab === "edit") {
      setActiveTab("profile");
      window.requestAnimationFrame(() => {
        profileHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        profileHeadingRef.current?.focus();
      });
    }
  }, [location.search]);

  const fetchProfile = async () => {
    try {
      const res = await getProfile(token);
      localStorage.setItem("wastezero-user-profile", JSON.stringify(res.data));
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        location: res.data.location || "",
        skills: res.data.skills?.join(", ") || "",
      });
    } catch (error) {
      console.log("Failed to load profile");
    }
  };

  /* ================= Update Profile ================= */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 12) : value;

    setProfileData({ ...profileData, [name]: nextValue });
  };

  const handleProfileSubmit = async () => {
    if (profileData.phone && (profileData.phone.length < 10 || profileData.phone.length > 12)) {
      setMessage("Phone number must be 10 to 12 digits.");
      return;
    }

    try {
      const response = await updateProfile(
        {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          skills: profileData.skills.split(",").map((s) => s.trim()),
        },
        token
      );

      localStorage.setItem("wastezero-user-profile", JSON.stringify(response.data));
      setProfileData((current) => ({
        ...current,
        name: response.data.name || current.name,
        email: response.data.email || current.email,
        phone: response.data.phone || "",
        location: response.data.location || current.location,
      }));
      console.log("Updated user:", response.data);
      window.dispatchEvent(
        new CustomEvent("wastezero-profile-updated", {
          detail: response.data,
        }),
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
          <h3 ref={profileHeadingRef} tabIndex="-1">Personal Information</h3>
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
                name="email"
                value={profileData.email}
                disabled
              />
              <small>This email is used for notifications.</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={12}
                placeholder="Enter your phone number"
              />
              <small>Optional. Use 10 to 12 digits.</small>
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
          <h3 ref={passwordHeadingRef} tabIndex="-1">Change Password</h3>
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

import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: user.name,
    skills: (user.skills || []).join(","),
    location: user.location || "",
    bio: user.bio || ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [msg, setMsg] = useState("");

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location: form.location,
      bio: form.bio
    };

    const { data } = await api.patch("/users/me", payload);
    setUser(data.user);
    setMsg("Profile updated");
  };

  return (
    <section>
      <header className="page-head">
        <h1>My Profile</h1>
        <p>Manage your account information and settings</p>
      </header>

      <div className="tab-switch">
        <button className={tab === "profile" ? "active-tab" : ""} onClick={() => setTab("profile")} type="button">
          Profile
        </button>
        <button className={tab === "password" ? "active-tab" : ""} onClick={() => setTab("password")} type="button">
          Password
        </button>
      </div>

      {tab === "profile" ? (
        <form onSubmit={save} className="grid card profile-form">
          <h2>Personal Information</h2>
          <p className="small">Update your personal information and profile details</p>
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Email</label>
          <input value={user.email} disabled />
          <p className="small">This is the email address used for account notifications.</p>
          <label>Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="location"
          />
          <p className="small">This helps match you with nearby opportunities.</p>
          <label>Skills</label>
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="teamwork, communication"
          />
          <label>Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
              setMsg("New password and confirm password do not match");
              return;
            }
            setMsg("Password change endpoint can be added next.");
          }}
          className="grid card profile-form"
        >
          <h2>Change Password</h2>
          <p className="small">Update your password to secure your account</p>
          <label>Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <label>New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <p className="small">Password must be at least 6 characters long.</p>
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
          <button type="submit">Change Password</button>
        </form>
      )}
      {msg && <p className="success">{msg}</p>}
    </section>
  );
};

export default ProfilePage;

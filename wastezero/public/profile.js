/* ================= LOAD SIDEBAR ================= */
fetch("sidebar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("sidebar").innerHTML = data;

    // Highlight active page link
    const links = document.querySelectorAll(".sidebar nav a");
    links.forEach(link => {
      if (link.getAttribute("href") === "profile.html") {
        link.classList.add("active");
      }
    });

    // Load user info into sidebar
    const userName = localStorage.getItem("name") || "User";
    const userEmail = localStorage.getItem("email") || "email@example.com";

    const avatar = document.getElementById("userAvatar");
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");

    if (avatar) avatar.textContent = userName.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;
  });

const token = localStorage.getItem("token");

/* ================= TAB SWITCHING ================= */
const profileTab = document.getElementById("profileTab");
const passwordTab = document.getElementById("passwordTab");
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

profileTab.addEventListener("click", () => {
  profileTab.classList.add("active");
  passwordTab.classList.remove("active");
  profileForm.classList.remove("hidden");
  passwordForm.classList.add("hidden");
});

passwordTab.addEventListener("click", () => {
  passwordTab.classList.add("active");
  profileTab.classList.remove("active");
  passwordForm.classList.remove("hidden");
  profileForm.classList.add("hidden");
});

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch("http://localhost:3000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("location").value = data.location || "";
    document.getElementById("role").value = data.role || "Volunteer";

  } catch (err) {
    console.error("Profile load error:", err);
  }
}
loadProfile();

/* ================= UPDATE PROFILE ================= */
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await fetch("http://localhost:3000/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        location: document.getElementById("location").value,
        role: document.getElementById("role").value
      })
    });

    alert("Profile Updated!");
  } catch (err) {
    console.error("Update error:", err);
  }
});

/* ================= CHANGE PASSWORD ================= */
passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3000/api/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: document.getElementById("currentPassword").value,
        newPassword: document.getElementById("newPassword").value
      })
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error("Password change error:", err);
  }
});

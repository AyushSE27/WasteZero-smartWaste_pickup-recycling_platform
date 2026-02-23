const API = "http://localhost:3000";

/* ================== LOGIN (DIRECT WITHOUT OTP) ================== */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      // Save token
      localStorage.setItem("token", data.token);

      alert("Login successful ✅");
      window.location.href = "/dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
}


/* ================== REGISTER ================== */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName")?.value || "";
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword")?.value;

    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Registered successfully! You can now login.");
      window.location.href = "/login.html";

    } catch (err) {
      alert("Registration failed");
      console.error(err);
    }
  });
}




/* ================== DASHBOARD AUTH ================== */
if (window.location.pathname.includes("dashboard.html")) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
  }
}


/* ================== LOAD PROFILE (DYNAMIC USER) ================== */
if (window.location.pathname.includes("dashboard.html")) {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
  } else {
    fetch(`${API}/api/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(user => {
      if (!user) return;

      // Update Name
      const nameEl = document.getElementById("userName");
      if (nameEl) nameEl.innerText = user.name || "User";

      // Update Email
      const emailEl = document.getElementById("userEmail");
      if (emailEl) emailEl.innerText = user.email;

      // Update Avatar first letter
      const avatarEl = document.getElementById("userAvatar");
      if (avatarEl) {
        const letter = (user.name || user.email).charAt(0).toUpperCase();
        avatarEl.innerText = letter;
      }
    })
    .catch(err => console.error("Profile load error:", err));
  }
}



/* ================== LOGOUT ================== */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}

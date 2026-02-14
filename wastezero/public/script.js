const API = "http://localhost:3000";

/* ================== LOGIN ================== */
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

      // Save token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = "/dashboard.html";
    } catch (err) {
      alert("Login failed");
      console.error(err);
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

  // Display logged-in user info
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const userNameEl = document.getElementById("userName");
    const userEmailEl = document.getElementById("userEmail");
    const avatarEl = document.getElementById("avatar");

    if (userNameEl) userNameEl.innerText = user.name;
    if (userEmailEl) userEmailEl.innerText = user.email;
    if (avatarEl) avatarEl.innerText = user.name.charAt(0).toUpperCase();
  }
}

/* ================== LOGOUT ================== */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  });
}

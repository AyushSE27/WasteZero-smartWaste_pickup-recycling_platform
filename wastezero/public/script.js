const API = "http://localhost:3000";

/* ================== LOGIN WITH OTP ================== */
const loginForm = document.getElementById("loginForm");

if (loginForm) {

  let otpStep = false;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const otp = document.getElementById("loginOtp")?.value;
    const otpSection = document.getElementById("otpSection");
    const loginBtn = document.getElementById("loginBtn");

    try {

      /* ===== STEP 1: SEND OTP ===== */
      if (!otpStep) {

        const res = await fetch(`${API}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.message);

        alert("OTP sent to your email 📩");

        // Show OTP input
        otpSection.style.display = "block";
        loginBtn.innerText = "Verify OTP";

        otpStep = true;
      }

      /* ===== STEP 2: VERIFY OTP ===== */
      else {

        const res = await fetch(`${API}/api/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.message);

        // Save token
        localStorage.setItem("token", data.token);

        alert("Login successful ✅");

        window.location.href = "/dashboard.html";
      }

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


/* ================== LOGOUT ================== */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}

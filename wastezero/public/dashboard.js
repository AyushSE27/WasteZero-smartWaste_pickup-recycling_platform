// Redirect to login if not logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Logout button
document.querySelector(".logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// Optional: you can keep stats cards if needed
window.onload = function() {
  const pickups = JSON.parse(localStorage.getItem("pickups")) || [];

  // Update stats cards (total and scheduled)
  const total = pickups.length;
  const scheduled = pickups.filter(p => p.status === "Scheduled").length;

  document.querySelectorAll(".cards .card")[0].querySelector("strong").innerText = total;
  document.querySelectorAll(".cards .card")[1].querySelector("strong").innerText = scheduled;

  // Remove all code related to showing recent pickups here
};

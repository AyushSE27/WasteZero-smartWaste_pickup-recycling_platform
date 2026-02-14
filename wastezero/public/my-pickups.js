// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Logout
document.querySelector(".logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// On page load
window.onload = function() {
  const pickups = JSON.parse(localStorage.getItem("pickups")) || [];
  const list = document.getElementById("pickupList");

  if (pickups.length === 0) {
    list.innerHTML = "<p>No pickups scheduled yet.</p>";
    return;
  }

  // Clear container
  list.innerHTML = "";

  pickups.forEach(p => {
    const item = document.createElement("div");
    item.classList.add("box"); // same style as your static box
    item.innerHTML = `
      <strong>${p.type}</strong><br>
      ${p.address}<br>
      ${p.date} • ${p.time}<br>
      <span class="badge">${p.status}</span>
    `;
    list.appendChild(item);
  });
};

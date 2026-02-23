// STEP ELEMENTS
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const form2 = document.getElementById("pickupForm2");

const tabNew = document.getElementById("tabNew");
const tabHistory = document.getElementById("tabHistory");
const historyCard = document.getElementById("historyCard");

// ================= NEXT STEP VALIDATION =================
nextBtn.addEventListener("click", () => {
  const address = document.getElementById("address");
  const city = document.getElementById("city");
  const date = document.getElementById("date");
  const timeSlot = document.getElementById("timeSlot");

  if (!address.value.trim()) return alert("Please enter address");
  if (!city.value.trim()) return alert("Please enter city");
  if (!date.value) return alert("Please select pickup date");
  if (!timeSlot.value) return alert("Please select time slot");

  step1.style.display = "none";
  step2.style.display = "block";
});

// ================= PREVIOUS STEP =================
prevBtn.addEventListener("click", () => {
  step2.style.display = "none";
  step1.style.display = "block";
});

// ================= SAVE PICKUP + SHOW HISTORY =================
form2.addEventListener("submit", (e) => {
  e.preventDefault();

  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const date = document.getElementById("date").value;
  const timeSlot = document.getElementById("timeSlot").value;
  const notes = document.getElementById("notes").value.trim();

  const wasteTypes = Array.from(
    document.querySelectorAll('.checkbox-grid input:checked')
  ).map(cb => cb.value);

  if (wasteTypes.length === 0) {
    alert("Please select at least one waste type");
    return;
  }

  const pickup = {
    address,
    city,
    date,
    timeSlot,
    wasteTypes,
    notes
  };

  const pickups = JSON.parse(localStorage.getItem("pickups")) || [];
  pickups.push(pickup);
  localStorage.setItem("pickups", JSON.stringify(pickups));

  alert("Pickup Scheduled Successfully!");

  // Switch to History tab automatically
  historyCard.style.display = "block";
  step1.style.display = "none";
  step2.style.display = "none";
  tabHistory.classList.add("active");
  tabNew.classList.remove("active");

  loadHistory();

  // Reset form (optional but good UX)
  document.getElementById("pickupForm").reset();
  document.getElementById("pickupForm2").reset();
});
// ================= TAB SWITCH → HISTORY =================
tabHistory.addEventListener("click", () => {
  historyCard.style.display = "block";
  step1.style.display = "none";
  step2.style.display = "none";
  tabHistory.classList.add("active");
  tabNew.classList.remove("active");
  loadHistory();
});

// ================= TAB SWITCH → NEW PICKUP =================
tabNew.addEventListener("click", () => {
  historyCard.style.display = "none";
  step1.style.display = "block";
  step2.style.display = "none";
  tabNew.classList.add("active");
  tabHistory.classList.remove("active");
});

// ================= LOAD HISTORY =================
function loadHistory() {
  const list = document.getElementById("historyList");
  const pickups = JSON.parse(localStorage.getItem("pickups")) || [];

  if (pickups.length === 0) {
    list.innerHTML = "<p>No pickups scheduled yet.</p>";
    return;
  }

  list.innerHTML = pickups.map((p, index) => `
    <div class="history-item">
      <h4>
        <i class="fa-solid fa-calendar-days"></i> ${p.date} |
        <i class="fa-solid fa-clock"></i> ${p.timeSlot}
      </h4>

      <p>
        <i class="fa-solid fa-location-dot"></i>
        <strong>Address:</strong> ${p.address}, ${p.city}
      </p>

      <p>
        <i class="fa-solid fa-recycle"></i>
        <strong>Waste Types:</strong>
        ${(p.wasteTypes || []).join(", ") || "Not specified"}
      </p>

      <p>
        <i class="fa-solid fa-note-sticky"></i>
        <strong>Notes:</strong> ${p.notes || "None"}
      </p>
      
      <button class="delete-btn" onclick="deletePickup(${index})">
        <i class="fa-solid fa-trash"></i> Delete
      </button>
    </div>
  `).join("");
}
function deletePickup(index) {
  const pickups = JSON.parse(localStorage.getItem("pickups")) || [];
  
  pickups.splice(index, 1); // remove selected pickup
  localStorage.setItem("pickups", JSON.stringify(pickups));

  loadHistory(); // refresh history UI
}
// ================= LOAD ON PAGE START =================
window.onload = function () {
  loadHistory();
};
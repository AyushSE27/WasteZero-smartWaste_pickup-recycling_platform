import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const defaultForm = {
  address: "",
  city: "",
  pickupDate: "",
  timeSlot: "",
  notes: "",
  wasteTypes: []
};

const wasteTypeOptions = ["Plastic", "Glass", "Electronic Waste", "Other", "Paper", "Metal", "Organic Waste"];

const timeSlots = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00"];

const SchedulePickupPage = () => {
  const [tab, setTab] = useState("schedule");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [pickups, setPickups] = useState([]);

  const load = async () => {
    const { data } = await api.get("/pickups");
    setPickups(data.pickups || []);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedWasteType = useMemo(() => {
    if (!form.wasteTypes.length) return "plastic";
    return form.wasteTypes[0].toLowerCase().replace(" ", "").replace("electronicwaste", "ewaste");
  }, [form.wasteTypes]);

  const nextStep = () => {
    if (!form.address || !form.city || !form.pickupDate || !form.timeSlot) return;
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const schedulePickup = async (e) => {
    e.preventDefault();

    const payload = {
      wasteType: selectedWasteType,
      location: form.city,
      address: form.address,
      scheduledAt: `${form.pickupDate} ${form.timeSlot}`,
      notes: `${form.notes || ""}\nWaste types: ${form.wasteTypes.join(", ")}`.trim()
    };

    await api.post("/pickups", payload);
    setForm(defaultForm);
    setStep(1);
    setTab("history");
    load();
  };

  return (
    <section>
      <header className="page-head">
        <h1>Schedule Pickup</h1>
        <p>Request waste collection and manage your pickups</p>
      </header>

      <div className="pickup-tabs">
        <button className={tab === "schedule" ? "active-tab" : ""} onClick={() => setTab("schedule")}>Schedule New Pickup</button>
        <button className={tab === "history" ? "active-tab" : ""} onClick={() => setTab("history")}>Pickup History</button>
      </div>

      {tab === "schedule" && (
        <form onSubmit={schedulePickup} className="card pickup-form">
          <h2>Request Waste Collection</h2>
          <p className="small">Fill in the details to schedule a pickup for your recyclable waste</p>

          {step === 1 && (
            <>
              <label>Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your street address"
              />

              <div className="grid grid-2">
                <div>
                  <label>City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label>Pickup Date</label>
                  <input
                    type="date"
                    value={form.pickupDate}
                    onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                  />
                </div>
              </div>

              <label>Preferred Time Slot</label>
              <select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <div className="row-end">
                <button type="button" onClick={nextStep}>
                  Next Step
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label>Waste Types</label>
              <p className="small">Select the types of waste you want to recycle</p>
              <div className="waste-grid">
                {wasteTypeOptions.map((type) => (
                  <label key={type} className="check-row">
                    <input
                      type="checkbox"
                      checked={form.wasteTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, wasteTypes: [...form.wasteTypes, type] });
                        } else {
                          setForm({ ...form, wasteTypes: form.wasteTypes.filter((t) => t !== type) });
                        }
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>

              <label>Additional Notes</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or information about your waste"
              />
              <p className="small">Please provide any additional details that might help our pickup team.</p>

              <div className="row-between">
                <button type="button" className="secondary-btn" onClick={prevStep}>
                  Previous Step
                </button>
                <button type="submit">Schedule Pickup</button>
              </div>
            </>
          )}
        </form>
      )}

      {tab === "history" && (
        <div className="card pickup-history">
          <h2>Your Pickup History</h2>
          <p className="small">View and manage all your scheduled pickups</p>

          {!pickups.length ? (
            <div className="empty-history">
              <p>You haven't scheduled any pickups yet.</p>
              <button className="secondary-btn" onClick={() => setTab("schedule")}>
                Schedule your first pickup
              </button>
            </div>
          ) : (
            <div className="list">
              {pickups.map((p) => (
                <article key={p.id} className="list-item">
                  <p>
                    <strong>{p.wasteType}</strong> | {p.address}
                  </p>
                  <p>
                    {p.location} | {p.scheduledAt}
                  </p>
                  <p>
                    Status: <strong>{p.status}</strong> | Agent: {p.assignedAgentId || "Pending"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SchedulePickupPage;

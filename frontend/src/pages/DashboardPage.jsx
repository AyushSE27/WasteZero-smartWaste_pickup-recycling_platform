import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [opRes, pickRes, msgRes] = await Promise.all([
        api.get("/opportunities"),
        api.get("/pickups"),
        api.get("/messages")
      ]);
      setOpportunities(opRes.data.opportunities || []);
      setPickups(pickRes.data.pickups || []);
      setMessages(msgRes.data.messages || []);
    };
    load();
  }, []);

  const openOpportunities = useMemo(
    () => opportunities.filter((o) => (o.status || "open") === "open"),
    [opportunities]
  );

  const completedPickups = useMemo(
    () => pickups.filter((p) => p.status === "completed").length,
    [pickups]
  );

  const recycledItems = useMemo(() => pickups.length * 20 + openOpportunities.length * 5, [pickups, openOpportunities]);

  return (
    <section>
      <header className="page-head">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}! Here's your waste management overview.</p>
      </header>

      <div className="stats-grid">
        <article className="card stat-card">
          <h4>Total Pickups</h4>
          <strong>{pickups.length}</strong>
          <span className="up">? 7.2% from last month</span>
        </article>
        <article className="card stat-card">
          <h4>Recycled Items</h4>
          <strong>{recycledItems}</strong>
          <span className="up">? 12.4% from last month</span>
        </article>
        <article className="card stat-card">
          <h4>CO2 Saved (kg)</h4>
          <strong>{Math.max(80, completedPickups * 8 + 40)}</strong>
          <span className="up">? 18.3% from last month</span>
        </article>
        <article className="card stat-card">
          <h4>Volunteer Hours</h4>
          <strong>{Math.max(10, openOpportunities.length * 4)}</strong>
          <span className="down">? 3.1% from last month</span>
        </article>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="row-between">
            <h3>Upcoming Pickups</h3>
            <span className="small">View All</span>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!pickups.length && (
                <tr>
                  <td colSpan={4} className="empty-td">
                    No upcoming pickups scheduled.
                  </td>
                </tr>
              )}
              {pickups.slice(0, 4).map((pickup) => (
                <tr key={pickup.id}>
                  <td>{pickup.scheduledAt || "--"}</td>
                  <td>{pickup.address || pickup.location}</td>
                  <td>{pickup.status}</td>
                  <td>Track</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card breakdown-card">
          <div className="row-between">
            <h3>Recycling Breakdown</h3>
            <span className="small">This Month</span>
          </div>
          <div className="break-row">
            <span>Plastic</span>
            <span>40%</span>
            <div className="bar"><i style={{ width: "40%" }} /></div>
          </div>
          <div className="break-row">
            <span>Paper</span>
            <span>25%</span>
            <div className="bar"><i style={{ width: "25%" }} /></div>
          </div>
          <div className="break-row">
            <span>Glass</span>
            <span>15%</span>
            <div className="bar"><i style={{ width: "15%" }} /></div>
          </div>
          <div className="break-row">
            <span>E-Waste</span>
            <span>10%</span>
            <div className="bar"><i style={{ width: "10%" }} /></div>
          </div>
          <div className="break-row">
            <span>Organic</span>
            <span>10%</span>
            <div className="bar"><i style={{ width: "10%" }} /></div>
          </div>
          <hr />
          <div className="row-between total-collected">
            <div>
              <p className="small">Total Collected</p>
              <strong>{(pickups.length * 4.2 + 12).toFixed(1)} kg</strong>
            </div>
            <span className="up">? 10.2%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Recent Messages</h3>
          <span className="small">View All</span>
        </div>
        {messages.slice(0, 3).map((m) => (
          <div key={m.id} className="list-row">
            <strong>{m.sender_id}</strong>
            <span>{m.content}</span>
          </div>
        ))}
        {!messages.length && <p className="small">No recent messages.</p>}
      </div>
    </section>
  );
};

export default DashboardPage;

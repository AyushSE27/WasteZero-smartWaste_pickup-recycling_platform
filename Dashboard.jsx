import { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>WasteZero Dashboard</h1>
      {data && (
        <>
          <p>Total Pickups: {data.total_pickups}</p>
          <p>Active Opportunities: {data.active_opportunities}</p>
          <p>CO2 Saved: {data.co2_saved} kg</p>
        </>
      )}
    </div>
  );
}

export default Dashboard;

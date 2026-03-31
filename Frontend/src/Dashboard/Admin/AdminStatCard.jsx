const AdminStatCard = ({ icon: Icon, title, value, tone, accent }) => {
  return (
    <article className={`admin-kpi-card tone-${tone}`}>
      <div className="admin-kpi-icon-wrap">
        <span className="admin-kpi-icon" style={{ background: accent }}>
          <Icon />
        </span>
      </div>
      <div className="admin-kpi-copy">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </article>
  );
};

export default AdminStatCard;
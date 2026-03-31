const AdminSection = ({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}) => {
  return (
    <section id={id} className={`admin-surface ${className}`.trim()}>
      <div className="admin-section-head">
        <div>
          {eyebrow ? <span className="admin-eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="admin-section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default AdminSection;
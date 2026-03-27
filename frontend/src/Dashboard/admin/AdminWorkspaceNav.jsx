const AdminWorkspaceNav = ({ items }) => {
  return (
    <aside className="admin-workspace-nav">
      <div className="admin-workspace-brand">
        <span>WZ</span>
        <div>
          <strong>WasteZero Admin</strong>
          <small>Operations workspace</small>
        </div>
      </div>

      <nav className="admin-anchor-nav">
        {items.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default AdminWorkspaceNav;

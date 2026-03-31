const AdminDataTable = ({
  columns,
  rows,
  renderRow,
  emptyMessage,
  className = "",
}) => {
  return (
    <div className={`admin-data-table ${className}`.trim()}>
      <div className="admin-data-row admin-data-row-header">
        {columns.map((column) => (
          <div key={column.key} className={column.className || ""}>
            {column.label}
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty-state">{emptyMessage}</div>
      ) : (
        rows.map((row, index) => renderRow(row, index))
      )}
    </div>
  );
};

export default AdminDataTable;
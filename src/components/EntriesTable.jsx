export default function EntriesTable({ entries, emptyText = "No data", onEdit, onDelete }) {
  if (!entries || entries.length === 0) {
    return <div className="empty">{emptyText}</div>;
  }

  const showActions = typeof onEdit === "function" || typeof onDelete === "function";

  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: showActions ? "28%" : "34%" }}>Name</th>
            <th style={{ width: showActions ? "40%" : "43%" }}>Email</th>
            <th style={{ width: showActions ? "20%" : "23%" }}>Phone</th>
            {showActions && <th style={{ width: "12%" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((x) => (
            <tr key={x.id}>
              <td className="cellStrong">{x.name}</td>
              <td className="cellMono">{x.email}</td>
              <td className="cellMono">{x.phone}</td>

              {showActions && (
                <td>
                  <div className="rowActions">
                    {onEdit && (
                      <button className="miniBtn" onClick={() => onEdit(x.id)}>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="miniBtn danger"
                        onClick={() => {
                          const ok = window.confirm("Delete this entry?");
                          if (ok) onDelete(x.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


import { useMemo, useState } from "react";
import EntriesTable from "./EntriesTable.jsx";

export default function ShowEntries({ entries, onEdit, onDelete }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return entries;

    return entries.filter((x) => {
      const name = (x.name || "").toLowerCase();
      const email = (x.email || "").toLowerCase();
      const phone = (x.phone || "").toLowerCase();

      return (
        name.startsWith(query) ||
        email.startsWith(query) ||
        phone.startsWith(query)
      );
    });
  }, [q, entries]);

  return (
    <section className="card">
      <div className="cardHead">
        <h2>Show Entries</h2>
        <div className="pill">
          Showing: <b>{filtered.length}</b> / {entries.length}
        </div>
      </div>

      <div className="searchRow">
        <div className="searchBox">
          <span className="searchIcon">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search (e.g. "ae", "98", "test@")'
            aria-label="Search entries"
          />
        </div>

        <button className="btn secondary" onClick={() => setQ("")} disabled={!q.trim()}>
          Clear
        </button>
      </div>

      <p className="hint">
        Search is <b>case-insensitive</b> and matches values that <b>start with</b> your text (name/email/phone).
      </p>

      <EntriesTable
        entries={filtered}
        emptyText={entries.length === 0 ? "No entries available." : "No matching results."}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
}

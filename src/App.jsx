import { useEffect, useMemo, useState } from "react";
import EntryForm from "./components/EntryForm.jsx";
import EntriesTable from "./components/EntriesTable.jsx";
import ShowEntries from "./components/ShowEntries.jsx";
import Dropdown from "./components/Dropdown.jsx";
import Toast from "./components/Toast.jsx";

const MAX_ENTRIES = 100;
const LS_ENTRIES_KEY = "entries_app_entries";
const LS_THEME_KEY = "entries_app_theme";

function loadEntries() {
  try {
    const raw = localStorage.getItem(LS_ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function loadTheme() {
  const t = localStorage.getItem(LS_THEME_KEY);
  return t === "light" || t === "dark" ? t : "dark";
}

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries());
  const [theme, setTheme] = useState(() => loadTheme());
  const [activeTab, setActiveTab] = useState("home"); 
  const [editingId, setEditingId] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (text, type = "ok") => setToast({ id: Date.now(), text, type });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const limitReached = entries.length >= MAX_ENTRIES;
  const remaining = useMemo(() => MAX_ENTRIES - entries.length, [entries.length]);

  const editingEntry = useMemo(
    () => entries.find((e) => e.id === editingId) || null,
    [entries, editingId]
  );

  const isEditing = !!editingEntry;
  const canSubmitNew = !limitReached;

  useEffect(() => {
    localStorage.setItem(LS_ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(LS_THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const addEntry = (newEntry) => {
    if (limitReached) {
      showToast(`Maximum ${MAX_ENTRIES} entries reached`, "err");
      return;
    }
    setEntries((prev) => [newEntry, ...prev]);
    showToast("Entry added successfully ✅", "ok");
  };

  const updateEntry = (updated) => {
    setEntries((prev) =>
      prev.map((x) => (x.id === updated.id ? { ...x, ...updated, updatedAt: Date.now() } : x))
    );
    setEditingId(null);
    showToast("Entry updated successfully ✅", "ok");
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
    showToast("Entry deleted successfully 🗑️", "err");
  };

  const startEdit = (id) => {
    setEditingId(id);
    setActiveTab("home");
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="app">
      <header className="header">
        <div className="topRow">
          <div className="brand">
            <div className="logo">E</div>
            <div>
              <h1>Entries Manager</h1>
            </div>
          </div>

          <div className="rightTools">
            <Dropdown
              entries={entries}
              remainingSlots={MAX_ENTRIES - entries.length}
              onNew={() => {
                setEditingId(null);
                setActiveTab("home");
              }}
              onPickEntry={(id) => {
                setEditingId(id);
                setActiveTab("home");
              }}
              onBulkAdd={(newOnes) => {
                if (newOnes.length === 0) return;
                setEntries((prev) => [...newOnes, ...prev].slice(0, MAX_ENTRIES));
                showToast(`${newOnes.length} entries added successfully ✅`, "ok");
              }}
            />

            <button className="themeBtn" onClick={toggleTheme} aria-label="Toggle theme">
              <span className="themeIcon">{theme === "dark" ? "🌙" : "☀️"}</span>
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        <nav className="tabs">
          <button
            className={`tab ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Entry Form
          </button>
          <button
            className={`tab ${activeTab === "show" ? "active" : ""}`}
            onClick={() => setActiveTab("show")}
          >
            Show Entries
          </button>
        </nav>
      </header>

      <main className="container">
        {activeTab === "home" ? (
          <>
            <section className="card">
              <div className="cardHead">
                <h2>Entry Form</h2>
                <div className="pill">
                  Remaining: <b>{remaining}</b>
                </div>
              </div>

              {!isEditing && limitReached && (
                <div className="alert">
                  <b>Maximum {MAX_ENTRIES} entries reached.</b> New entry submission is disabled.
                </div>
              )}

              {isEditing && (
                <div className="editBar">
                  <div>
                    Editing: <b>{editingEntry.name}</b>
                  </div>
                  <button className="btn secondary" type="button" onClick={cancelEdit}>
                    Cancel Edit
                  </button>
                </div>
              )}

              <EntryForm
                onAddEntry={addEntry}
                onUpdateEntry={updateEntry}
                editingEntry={editingEntry}
                disabled={!isEditing && !canSubmitNew}
              />
            </section>

            <section className="card">
              <div className="cardHead">
                <h2>Entries Display</h2>
                <div className="pill">
                  Total: <b>{entries.length}</b> / {MAX_ENTRIES}
                </div>
              </div>

              <EntriesTable
                entries={entries}
                emptyText="No entries yet. Add one above."
                onEdit={(id) => startEdit(id)}
                onDelete={(id) => deleteEntry(id)}
              />
            </section>
          </>
        ) : (
          <ShowEntries
            entries={entries}
            onEdit={(id) => startEdit(id)}
            onDelete={(id) => deleteEntry(id)}
          />
        )}

        {toast && (
          <Toast
            type={toast.type}
            text={toast.text}
            onClose={() => setToast(null)}
          />
        )}
      </main>

      <footer className="footer">
        <span>Data is saved in localStorage</span>
      </footer>
    </div>
  );
}

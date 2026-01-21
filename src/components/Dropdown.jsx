import { useEffect, useMemo, useRef, useState } from "react";

const isTextOnly = (v) => /^[A-Za-z ]+$/.test(v.trim());
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isNumeric = (v) => /^\d+$/.test(v.trim());

const autoFixEmail = (raw) => {
  const v = (raw || "").trim();

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  if (!v.includes("@")) return v ? `${v}@gmail.com` : v;

  const [user, rest] = v.split("@");
  if (!rest || rest.trim() === "") return `${user}@gmail.com`;

  const r = rest.trim().toLowerCase();
  if (r === "gmail" || r === "gmail.") return `${user}@gmail.com`;
  if (r === "gmail.co") return `${user}@gmail.com`;

  return v;
};

function parseLine(line) {
  const s = line.trim();
  if (!s) return null;

  const low = s.toLowerCase();
  if (low.includes("name") && low.includes("email") && low.includes("phone")) return null;

  const pickDelim = (txt) => {
    if (txt.includes(",")) return ",";
    if (txt.includes("|")) return "|";
    if (txt.includes("\t")) return "\t";
    if (txt.includes(";")) return ";";
    return null;
  };

  const delim = pickDelim(s);

  if (delim) {
    const parts = s.split(delim).map((x) => x.trim()).filter(Boolean);
    if (parts.length < 3) return null;
    const name = parts[0];
    const email = parts[1];
    const phone = parts[2];
    return { name, email, phone };
  }

  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return null;

  const phone = tokens[tokens.length - 1];
  const email = tokens[tokens.length - 2];
  const name = tokens.slice(0, -2).join(" ");
  return { name, email, phone };
}

function validateEntry({ name, email, phone }) {
  const n = (name || "").trim();
  const e = autoFixEmail(email || "");
  const p = (phone || "").trim();

  if (!n) return "Name missing";
  if (!isTextOnly(n)) return "Name must be letters only";

  if (!e) return "Email missing";
  if (!isValidEmail(e)) return "Invalid email";

  if (!p) return "Phone missing";
  if (!isNumeric(p)) return "Phone must be numeric";
  if (p.length < 7 || p.length > 15) return "Phone length must be 7–15 digits";

  return null;
}

export default function Dropdown({
  entries,
  remainingSlots,
  onNew,
  onPickEntry,
  onBulkAdd,
}) {
  const [open, setOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [msg, setMsg] = useState(null); 
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const previewCount = useMemo(() => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.length;
  }, [bulkText]);

  const doImport = () => {
    const lines = bulkText.split("\n");
    const added = [];
    const skipped = [];

    let slots = remainingSlots;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const parsed = parseLine(raw);
      if (!parsed) continue;

      if (slots <= 0) {
        skipped.push(`Line ${i + 1}: limit reached`);
        continue;
      }

      const err = validateEntry(parsed);
      if (err) {
        skipped.push(`Line ${i + 1}: ${err}`);
        continue;
      }

      added.push({
        id: crypto.randomUUID(),
        name: parsed.name.trim(),
        email: autoFixEmail(parsed.email),
        phone: parsed.phone.trim(),
        createdAt: Date.now(),
      });
      slots--;
    }

    if (added.length > 0) onBulkAdd?.(added);

    if (added.length === 0) {
      setMsg({
        type: "err",
        text: skipped.length ? `Nothing added. Fix lines. Example: Name, email, phone` : "Nothing to add.",
      });
      return;
    }

    setBulkText("");
    setMsg({
      type: "ok",
      text: `Added ${added.length} entries.${skipped.length ? ` Skipped ${skipped.length}.` : ""}`,
    });
  };

  return (
    <div className="picker" ref={wrapRef}>
      <button
        className="iconBtn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open entries dropdown"
        title="Bulk paste / pick entry"
      >
        ▾
      </button>

      {open && (
        <div className="menu">
          <button
            className="menuItem"
            onClick={() => {
              setOpen(false);
              setMsg(null);
              onNew?.();
            }}
          >
            + New Entry
          </button>

          <div className="menuDivider" />

          <div className="bulkHead">
            <div className="bulkTitle">Paste Entries</div>
            <div className="bulkMeta">
              Remaining slots: <b>{remainingSlots}</b>
            </div>
          </div>

          <div className="bulkHint">
            Paste one entry per line. Supported formats:
          </div>

          <textarea
            className="bulkArea"
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              setMsg(null);
            }}
            placeholder={`Example:\nAyesha Khan, ayesha, 9876543210\nFarhan Ali, farhan@gmail.com, 9999999999`}
            rows={6}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") doImport();
            }}
          />

          <div className="bulkActions">
            <div className="bulkCount">
              Lines: <b>{previewCount}</b>
            </div>

            <button
              className="btn"
              type="button"
              onClick={doImport}
              disabled={!bulkText.trim() || remainingSlots <= 0}
            >
              Add Entries
            </button>
          </div>

          {msg && (
            <div className={`bulkMsg ${msg.type === "ok" ? "ok" : "err"}`}>
              {msg.text}
            </div>
          )}

          <div className="menuDivider" />

          <div className="menuSmallTitle">Pick to Edit (loads into form)</div>

          {entries.length === 0 ? (
            <div className="menuEmpty">No entries yet</div>
          ) : (
            entries.map((x) => (
              <button
                key={x.id}
                className="menuItem"
                onClick={() => {
                  setOpen(false);
                  setMsg(null);
                  onPickEntry?.(x.id);
                }}
              >
                <div className="menuTitle">{x.name}</div>
                <div className="menuSub">
                  {x.email} • {x.phone}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

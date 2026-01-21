import { useEffect, useState } from "react";

const initialForm = { name: "", email: "", phone: "" };

const isTextOnly = (v) => /^[A-Za-z ]+$/.test(v.trim());
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isNumeric = (v) => /^\d+$/.test(v.trim());

const autoFixEmail = (raw) => {
  const v = raw.trim();

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;

  if (!v.includes("@")) return v ? `${v}@gmail.com` : v;

  const [user, rest] = v.split("@");

  if (!rest || rest.trim() === "") return `${user}@gmail.com`;

  const r = rest.trim().toLowerCase();
  if (r === "gmail" || r === "gmail.") return `${user}@gmail.com`;
  if (r === "gmail.co") return `${user}@gmail.com`;

  return v;
};

export default function EntryForm({
  onAddEntry,
  onUpdateEntry,
  editingEntry,
  disabled,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (editingEntry) {
      setForm({
        name: editingEntry.name || "",
        email: editingEntry.email || "",
        phone: editingEntry.phone || "",
      });
      setErrors({});
      setTouched({});
    } else {
      setForm(initialForm);
      setErrors({});
      setTouched({});
    }
  }, [editingEntry]);

  const validate = (nextForm = form) => {
    const e = {};
    const name = nextForm.name.trim();
    const email = autoFixEmail(nextForm.email);
    const phone = nextForm.phone.trim();

    if (!name) e.name = "Name is required";
    else if (!isTextOnly(name)) e.name = "Name must contain letters only";

    if (!email) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Enter a valid email";

    if (!phone) e.phone = "Phone number is required";
    else if (!isNumeric(phone)) e.phone = "Phone must be numeric";
    else if (phone.length < 7 || phone.length > 15) e.phone = "Phone length must be 7–15 digits";

    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "phone" ? value.replace(/[^\d]/g, "") : value;
    const nextForm = { ...form, [name]: nextValue };
    setForm(nextForm);

    if (touched[name]) setErrors(validate(nextForm));
  };

  const onBlur = (e) => {
    const { name } = e.target;

    if (name === "email") {
      setForm((p) => ({ ...p, email: autoFixEmail(p.email) }));
    }

    setTouched((p) => ({ ...p, [name]: true }));
    setErrors(validate());
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isEditing && disabled) return;

    const eMap = validate();
    setErrors(eMap);
    setTouched({ name: true, email: true, phone: true });

    if (Object.keys(eMap).length > 0) return;

    const payload = {
      name: form.name.trim(),
      email: autoFixEmail(form.email),
      phone: form.phone.trim(),
    };

    if (isEditing) {
      onUpdateEntry?.({
        id: editingEntry.id,
        ...payload,
      });
    } else {
      onAddEntry?.({
        id: crypto.randomUUID(),
        ...payload,
        createdAt: Date.now(),
      });
      setForm(initialForm);
      setErrors({});
      setTouched({});
    }
  };

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="grid">
        <div className="field">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. Ayesha Khan"
            disabled={!isEditing && disabled}
            autoComplete="off"
          />
          {touched.name && errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div className="field">
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. ayesha (auto adds @gmail.com)"
            disabled={!isEditing && disabled}
            autoComplete="off"
          />
          {touched.email && errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="field">
          <label>Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="e.g. 9876543210"
            disabled={!isEditing && disabled}
            autoComplete="off"
            inputMode="numeric"
          />
          {touched.phone && errors.phone && <p className="error">{errors.phone}</p>}
        </div>
      </div>

      <div className="actions">
        <button className="btn" type="submit" disabled={!isEditing && disabled}>
          {isEditing ? "Update Entry" : "Save Entry"}
        </button>

        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            if (isEditing && editingEntry) {
              setForm({
                name: editingEntry.name || "",
                email: editingEntry.email || "",
                phone: editingEntry.phone || "",
              });
            } else {
              setForm(initialForm);
            }
            setErrors({});
            setTouched({});
          }}
          disabled={!isEditing && disabled}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

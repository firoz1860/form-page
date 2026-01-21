export default function Toast({ type = "ok", text, onClose }) {
  return (
    <div className={`toast ${type}`} role="status" aria-live="polite">
      <div className="toastText">{text}</div>
      <button className="toastClose" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}

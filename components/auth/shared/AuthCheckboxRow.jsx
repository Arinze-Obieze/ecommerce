"use client";

export default function AuthCheckboxRow({
  checked,
  hovered,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  children,
  className = "",
}) {
  return (
    <div
      className={`zova-auth-check ${className}`.trim()}
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="zova-auth-checkbox"
        style={{
          "--auth-check-border": checked ? "var(--zova-primary-action)" : "var(--zova-border)",
          "--auth-check-bg": checked
            ? "var(--zova-primary-action)"
            : hovered
              ? "var(--zova-surface-alt)"
              : "white",
        }}
      >
        {checked ? (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
              d="M2 5.5L4.2 7.7L9 2.8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      <span className="zova-auth-check-label">{children}</span>
    </div>
  );
}

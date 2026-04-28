"use client";

export default function AuthSocialButton({
  icon,
  label,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <button
      type="button"
      className="zova-auth-social-btn"
      style={{
        "--auth-social-bg": hovered ? "var(--zova-surface-alt)" : "white",
        "--auth-social-shadow": hovered ? "0 3px 10px rgba(46,100,23,0.08)" : "none",
        "--auth-social-transform": hovered ? "translateY(-1px)" : "none",
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {icon}
      {label}
    </button>
  );
}

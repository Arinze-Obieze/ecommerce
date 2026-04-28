"use client";

export default function AuthStatusCard({
  tone = "neutral",
  title,
  icon,
  children,
  className = "",
}) {
  return (
    <div className={`zova-auth-status-card is-${tone} ${className}`.trim()}>
      {title ? (
        <div className="zova-auth-status-title">
          {icon}
          <span>{title}</span>
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
}

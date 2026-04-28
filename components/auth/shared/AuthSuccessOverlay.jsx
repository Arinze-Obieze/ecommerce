"use client";

export default function AuthSuccessOverlay({
  title,
  description,
  backdrop = "rgba(245,241,234,0.96)",
}) {
  return (
    <div
      className="zova-auth-overlay"
      style={{ background: backdrop, backdropFilter: "blur(16px)" }}
    >
      <div className="zova-auth-overlay-card">
        <div className="zova-auth-overlay-ring">
          <div className="zova-auth-overlay-core">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path
                d="M9 19L16.5 26.5L29 12"
                className="zova-auth-overlay-check"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <p
          className="serif"
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "var(--zova-text-strong)",
            margin: "0 0 8px",
            lineHeight: 1.1,
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: 14, color: "var(--zova-text-muted)", margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

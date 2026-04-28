"use client";

import { useState } from "react";
import { TRACK_STATUSES } from "@/components/content/how-to-track/howToTrack.constants";

export default function LiveTrackerDemo() {
  const [activeStatus, setActiveStatus] = useState(3);
  const status = TRACK_STATUSES[activeStatus];

  return (
    <div className="zova-info-card" style={{ overflow: "hidden", borderRadius: 20 }}>
      <div
        className="zova-info-dark-panel"
        style={{ borderRadius: 0, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div style={{ marginBottom: 4, color: "var(--zova-accent-emphasis)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Order #ZV-2024-08821
          </div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 700 }}>Classic Linen Shirt — Size B</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(46,100,23,0.4)",
            borderRadius: 20,
            background: "rgba(46,100,23,0.25)",
            padding: "8px 16px",
            color: "#7FFFC4",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {status.icon} {status.label}
        </div>
      </div>

      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
          {TRACK_STATUSES.map((item, index) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", flex: index < TRACK_STATUSES.length - 1 ? 1 : "none" }}>
              <div
                onClick={() => setActiveStatus(index)}
                title={item.label}
                style={{
                  width: 36,
                  height: 36,
                  zIndex: 1,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: index <= activeStatus ? "var(--zova-primary-action)" : "#F3F4F6",
                  border: `2px solid ${index <= activeStatus ? "var(--zova-primary-action)" : "#E5E7EB"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: index === activeStatus ? "0 0 0 4px var(--zova-green-soft)" : "none",
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                {index < activeStatus ? (
                  <span style={{ color: "white", fontSize: 13 }}>✓</span>
                ) : index === activeStatus ? (
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                ) : (
                  <span style={{ color: "#9CA3AF", fontSize: 11, fontWeight: 700 }}>{index + 1}</span>
                )}
              </div>
              {index < TRACK_STATUSES.length - 1 ? (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    margin: "0 2px",
                    background: index < activeStatus ? "var(--zova-primary-action)" : "#E5E7EB",
                    transition: "background 0.3s",
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${TRACK_STATUSES.length}, 1fr)`, marginBottom: 24 }}>
          {TRACK_STATUSES.map((item, index) => (
            <div
              key={item.key}
              onClick={() => setActiveStatus(index)}
              style={{ textAlign: "center", cursor: "pointer", padding: "0 2px" }}
            >
              <div
                style={{
                  color: index <= activeStatus ? "var(--zova-primary-action)" : "#9CA3AF",
                  fontSize: 10,
                  fontWeight: index === activeStatus ? 700 : 500,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px 28px" }}>
        <div style={{ padding: 20, borderRadius: 14, background: status.bg, border: `1px solid ${status.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 10,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {status.icon}
            </div>
            <div>
              <div style={{ marginBottom: 4, color: "#111111", fontSize: 15, fontWeight: 700 }}>{status.label}</div>
              <div style={{ color: status.color, fontSize: 11, fontWeight: 600 }}>ETA: {status.eta}</div>
            </div>
          </div>
          <p style={{ marginBottom: 14, color: "#4B5563", fontSize: 13, lineHeight: 1.75 }}>{status.desc}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {status.notifications.map((item) => (
              <span
                key={item}
                style={{
                  border: `1px solid ${status.border}`,
                  borderRadius: 6,
                  background: "white",
                  padding: "4px 10px",
                  color: status.color,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            border: "1px solid #D4EAE0",
            borderRadius: 10,
            background: "var(--zova-green-soft)",
            padding: "12px 16px",
            color: "var(--zova-text-strong)",
            fontSize: 12,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          👆 Click any step above to see what happens at each stage
        </div>
      </div>
    </div>
  );
}

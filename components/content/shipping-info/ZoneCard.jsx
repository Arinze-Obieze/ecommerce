export default function ZoneCard({ zone, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className="zova-info-card"
      style={{
        borderWidth: 2,
        borderColor: isActive ? zone.color : "#D4EAE0",
        padding: "20px",
        cursor: "pointer",
        boxShadow: isActive ? `0 6px 24px ${zone.color}20` : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: zone.bg,
              border: `1px solid ${zone.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {zone.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111111", lineHeight: 1.3 }}>{zone.zone}</div>
            <div style={{ fontSize: 11, color: zone.color, fontWeight: 600, marginTop: 2 }}>{zone.timeDetail}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: zone.color, lineHeight: 1 }}>{zone.time}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>delivery</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${zone.border}` }}>
        <span style={{ fontSize: 12, color: "#4B5563" }}>{zone.feeDetail}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: zone.color }}>{zone.fee}</span>
      </div>

      {isActive ? (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${zone.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: zone.color, marginBottom: 10 }}>
            Cities covered:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {zone.cities.map((city) => (
              <span
                key={city}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: zone.bg,
                  border: `1px solid ${zone.border}`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#1F2937",
                }}
              >
                {city}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>
            + all other towns and LGAs within this zone
          </div>
        </div>
      ) : null}
    </div>
  );
}

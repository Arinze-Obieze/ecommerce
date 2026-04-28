import SectionHeader from "@/components/content/shared/SectionHeader";
import { ABOUT_TEAM } from "@/components/content/about/about.constants";

export default function AboutTeamSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader
        kicker="The Team"
        title="The people behind ZOVA"
        copy="A small, focused team with big standards — based in the heart of Nigerian commerce."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }} className="max-md:grid-cols-2">
        {ABOUT_TEAM.map((member) => (
          <div key={member.name} className="zova-info-card" style={{ padding: "28px 20px", textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: member.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 800,
                boxShadow: `0 6px 20px ${member.color}40`,
              }}
            >
              {member.initials}
            </div>
            <div style={{ marginBottom: 4, color: "#111111", fontSize: 15, fontWeight: 700 }}>{member.name}</div>
            <div style={{ color: "var(--zova-primary-action)", fontSize: 12, fontWeight: 600 }}>{member.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { ABOUT_STATS } from "@/components/content/about/about.constants";
import useCountUp from "@/components/content/about/useCountUp";

function StatCard({ val, label, animate }) {
  const numeric = parseFloat(val.replace(/[^0-9.]/g, ""));
  const suffix = val.replace(/[0-9.,]/g, "");
  const count = useCountUp(val, 1600, animate);
  const display = Number.isNaN(numeric) ? val : `${count.toLocaleString()}${suffix}`;

  return (
    <div
      style={{
        border: "1px solid rgba(46,100,23,0.2)",
        borderRadius: 16,
        background: "rgba(255,255,255,0.07)",
        padding: "28px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ color: "var(--zova-accent-emphasis)", fontSize: 36, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>{display}</div>
      <div style={{ marginTop: 8, color: "#A8C4B8", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function AboutStatsSection({ sectionRef, inView }) {
  return (
    <div ref={sectionRef} style={{ background: "var(--zova-text-strong)", padding: "48px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, maxWidth: 860, margin: "0 auto" }} className="max-md:grid-cols-2">
        {ABOUT_STATS.map((item) => (
          <StatCard key={item.label} val={item.val} label={item.label} animate={inView} />
        ))}
      </div>
    </div>
  );
}

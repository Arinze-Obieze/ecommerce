import { useState, useEffect, useRef, useCallback } from "react";

// ── Premium color palette ──
// ── Zova brand palette (zova.ng 2026) ──
const C = {
  emerald:     "#2E6417",   // Zova Forest — primary green
  emeraldDeep: "#1e4410",   // Forest deep — hover / darker accent
  emeraldDark: "#0d2a08",   // Forest darkest — gate gradient base
  noir:        "#191B19",   // Onyx Black — backgrounds & text
  gold:        "#EC9C00",   // Gold Harvest — accent
  goldDark:    "#b87800",   // Gold dark — handles, shadows
  warmWhite:   "#F5F1EA",   // Soft Linen — card & surface bg
  cream:       "#FDFAF5",   // Near-white linen — subtle highlights
};

// ── Real product images (Unsplash) ──
const PRODUCTS = [
  { url: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200&h=260&fit=crop&auto=format&q=80", cat: "Dress", price: "$129" },
  { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=260&fit=crop&auto=format&q=80", cat: "Dress", price: "$89" },
  { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&h=260&fit=crop&auto=format&q=80", cat: "Dress", price: "$145" },
  { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop&auto=format&q=80", cat: "Bag", price: "$210" },
  { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop&auto=format&q=80", cat: "Bag", price: "$175" },
  { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=200&h=200&fit=crop&auto=format&q=80", cat: "Bag", price: "$320" },
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=140&fit=crop&auto=format&q=80", cat: "Shoes", price: "$95" },
  { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200&h=140&fit=crop&auto=format&q=80", cat: "Shoes", price: "$120" },
  { url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=140&fit=crop&auto=format&q=80", cat: "Shoes", price: "$85" },
  { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop&auto=format&q=80", cat: "Jewelry", price: "$65" },
  { url: "https://images.unsplash.com/photo-1573408301185-9519f94815fe?w=200&h=200&fit=crop&auto=format&q=80", cat: "Jewelry", price: "$48" },
  { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=140&fit=crop&auto=format&q=80", cat: "Shades", price: "$55" },
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&auto=format&q=80", cat: "Watch", price: "$299" },
  { url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=180&fit=crop&auto=format&q=80", cat: "Hat", price: "$42" },
  { url: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&h=260&fit=crop&auto=format&q=80", cat: "Perfume", price: "$78" },
  { url: "https://images.unsplash.com/photo-1558171813-a2ffc849c8b4?w=200&h=180&fit=crop&auto=format&q=80", cat: "Fabric", price: "$35" },
];

/* ─────────────────────────────────────────────────────────────
   FLOATING PRODUCT CARD
   ───────────────────────────────────────────────────────────── */
function FloatingCard({ product, style: s }) {
  return (
    <div
      style={{
        position: "absolute",
        left: s.left,
        bottom: "-12%",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 15,
        animation: `cardRise ${s.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${s.delay}s forwards`,
        transform: `rotate(${s.rotate}deg)`,
        filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.5))",
      }}
    >
      <div
        style={{
          width: s.w,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <img
          src={product.url}
          alt={product.cat}
          style={{
            width: "100%",
            height: s.h,
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
        <div style={{ padding: "6px 8px 8px" }}>
          <div
            style={{
              fontSize: 8,
              fontWeight: 600,
              color: "#888",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            {product.cat}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#111",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            {product.price}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORNATE GATE PANEL
   ───────────────────────────────────────────────────────────── */
function Gate({ side, open }) {
  const left = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        [left ? "left" : "right"]: 0,
        width: "50%",
        height: "100%",
        transformOrigin: left ? "left center" : "right center",
        transform: open
          ? `perspective(1600px) rotateY(${left ? "-" : ""}105deg)`
          : "perspective(1600px) rotateY(0deg)",
        transition: "transform 1.8s cubic-bezier(0.77, 0, 0.175, 1)",
        zIndex: 10,
        overflow: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${left ? "135deg" : "225deg"}, 
            #041F15 0%, #065F46 35%, #059669 55%, #065F46 75%, #041F15 100%)`,
        }}
      />
      {/* Ornamental border frame */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          bottom: "6%",
          left: left ? "12%" : "8%",
          right: left ? "8%" : "12%",
          border: "1px solid rgba(245,183,49,0.15)",
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "9%",
          bottom: "9%",
          left: left ? "15%" : "11%",
          right: left ? "11%" : "15%",
          border: "1px solid rgba(245,183,49,0.08)",
          borderRadius: 4,
        }}
      />
      {/* Vertical accent lines */}
      {[20, 40, 60, 80].map((p) => (
        <div
          key={p}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${p}%`,
            width: 1,
            background: "rgba(255,255,255,0.03)",
          }}
        />
      ))}
      {/* Door handle */}
      <div
        style={{
          position: "absolute",
          [left ? "right" : "left"]: "14%",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: `2px solid ${C.gold}`,
            boxShadow: `0 0 12px rgba(245,183,49,0.4)`,
          }}
        />
        <div
          style={{
            width: 4,
            height: 50,
            borderRadius: 3,
            background: `linear-gradient(to bottom, ${C.gold}, ${C.goldDark})`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: `2px solid ${C.gold}`,
          }}
        />
      </div>
      {/* Shadow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: left
            ? "inset -40px 0 60px rgba(0,0,0,0.4)"
            : "inset 40px 0 60px rgba(0,0,0,0.4)",
        }}
      />
      {/* Brand watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%) rotate(-90deg)",
          fontSize: 11,
          fontWeight: 900,
          color: "rgba(255,255,255,0.04)",
          letterSpacing: "0.6em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          fontFamily: "'Georgia', serif",
        }}
      >
        ZOVA MARKET
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STRIPED AWNING
   ───────────────────────────────────────────────────────────── */
function Awning({ visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        zIndex: 20,
        overflow: "hidden",
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s",
      }}
    >
      <div
        style={{
          height: "100%",
          background: `repeating-linear-gradient(90deg, 
            ${C.emerald} 0px, ${C.emerald} 32px, 
            ${C.emeraldDark} 32px, ${C.emeraldDark} 64px)`,
          position: "relative",
        }}
      >
        {/* Shine */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 60%)",
          }}
        />
        {/* Scalloped edge */}
        <svg
          viewBox="0 0 800 32"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            width: "100%",
            height: 28,
          }}
        >
          <path
            d={Array.from(
              { length: 21 },
              (_, i) =>
                `${i === 0 ? "M" : "Q"}${i === 0 ? "0,0" : `${i * 40 - 20},30 ${i * 40},0`}`
            ).join(" ") + " L800,32 L0,32 Z"}
            fill={C.noir}
          />
        </svg>
        {/* Gold tassels */}
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 26,
              left: `${i * 5.5 + 3}%`,
              width: 2,
              height: 12,
              background: C.gold,
              borderRadius: 1,
              opacity: 0.6,
              animation: `tasselSway 2s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   WELCOME BANNER
   ───────────────────────────────────────────────────────────── */
function Banner({ name, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 78,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 25,
        textAlign: "center",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease 0.3s",
      }}
    >
      {/* Hanging wires */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 110,
          marginBottom: -1,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 1.5,
              height: 18,
              background: `linear-gradient(to bottom, transparent, ${C.gold})`,
            }}
          />
        ))}
      </div>
      {/* Sign body */}
      <div
        style={{
          background: `linear-gradient(135deg, #FDE68A 0%, ${C.gold} 40%, #D97706 100%)`,
          padding: "14px 48px 16px",
          borderRadius: 8,
          position: "relative",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.1)",
        }}
      >
        {/* Ribbon ends */}
        <div
          style={{
            position: "absolute",
            left: -14,
            top: 0,
            bottom: 0,
            width: 14,
            background: "#92400E",
            clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -14,
            top: 0,
            bottom: 0,
            width: 14,
            background: "#92400E",
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          }}
        />
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#78350F",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            margin: "0 0 4px",
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
        >
          Welcome to
        </p>
        <p
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#1C1917",
            margin: 0,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            fontFamily: "'Georgia', serif",
          }}
        >
          {name}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ATMOSPHERIC LIGHT RAYS
   ───────────────────────────────────────────────────────────── */
function Rays({ progress }) {
  const alpha = 0.08 + progress * 0.22;
  const sources = [
    { x: "30%", angles: [-70, -45, -20, 5, 25] },
    { x: "70%", angles: [-25, -5, 20, 45, 70] },
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {sources.map((src, si) =>
        src.angles.map((ang, ai) => (
          <div
            key={`${si}-${ai}`}
            style={{
              position: "absolute",
              top: "10%",
              left: src.x,
              width: 3 + ai * 0.6,
              height: "240%",
              background: `linear-gradient(to bottom, 
                rgba(255,${210 + progress * 45},${70 + progress * 100},${alpha}) 0%, 
                rgba(255,${210 + progress * 45},${70 + progress * 100},${alpha * 0.3}) 30%, 
                transparent 55%)`,
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${ang}deg)`,
              animation: `rayFlicker ${2.8 + (si * 5 + ai) * 0.3}s ease-in-out ${(si * 5 + ai) * 0.15}s infinite alternate`,
            }}
          />
        ))
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CROWD SILHOUETTES
   ───────────────────────────────────────────────────────────── */
function Crowd({ visible }) {
  const people = [
    { x: "2%", h: 90, w: 28 },
    { x: "10%", h: 112, w: 32 },
    { x: "19%", h: 78, w: 24 },
    { x: "28%", h: 100, w: 30 },
    { x: "36%", h: 85, w: 26 },
    { x: "58%", h: 95, w: 28 },
    { x: "66%", h: 84, w: 25 },
    { x: "74%", h: 115, w: 33 },
    { x: "83%", h: 72, w: 24 },
    { x: "91%", h: 98, w: 29 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      {people.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: p.x,
            width: p.w,
            height: p.h,
            background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.15))",
            borderRadius: `${p.w / 2}px ${p.w / 2}px 0 0`,
            opacity: visible ? 0.65 : 0,
            transform: visible ? "translateY(0)" : "translateY(50px)",
            transition: `opacity 0.6s ease ${0.8 + i * 0.06}s, transform 0.8s cubic-bezier(0.34,1.2,0.64,1) ${0.8 + i * 0.06}s`,
          }}
        >
          {/* Head */}
          <div
            style={{
              position: "absolute",
              top: -p.w * 0.42,
              left: "50%",
              transform: "translateX(-50%)",
              width: p.w * 0.65,
              height: p.w * 0.65,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
            }}
          />
          {/* Shoulders */}
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "-25%",
              right: "-25%",
              height: p.w * 0.22,
              background: "rgba(0,0,0,0.25)",
              borderRadius: p.w,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LANTERN
   ───────────────────────────────────────────────────────────── */
function Lanterns({ visible, progress }) {
  if (!visible) return null;
  const lanterns = [
    { x: 7, y: 11 },
    { x: 24, y: 15 },
    { x: 76, y: 13 },
    { x: 93, y: 17 },
  ];
  return (
    <>
      {lanterns.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${l.y}%`,
            left: `${l.x}%`,
            zIndex: 18,
            transformOrigin: "top center",
            animation: `lanternSwing ${2.6 + i * 0.35}s ease-in-out infinite`,
            opacity: 0.3 + progress * 0.6,
          }}
        >
          <div
            style={{
              width: 1,
              height: 22,
              background: C.gold,
              margin: "0 auto",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              width: 22,
              height: 30,
              background: "linear-gradient(to bottom, #EF4444, #B91C1C)",
              borderRadius: "5px 5px 9px 9px",
              position: "relative",
              boxShadow: `0 0 ${10 + progress * 24}px rgba(239,68,68,${0.35 + progress * 0.45})`,
            }}
          >
            {/* Inner lines */}
            <div
              style={{
                position: "absolute",
                top: "28%",
                left: "18%",
                right: "18%",
                height: 1,
                background: "rgba(255,255,255,0.18)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "52%",
                left: "18%",
                right: "18%",
                height: 1,
                background: "rgba(255,255,255,0.18)",
              }}
            />
            {/* Glow core */}
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "20%",
                right: "20%",
                bottom: "25%",
                background:
                  "radial-gradient(circle, rgba(255,200,100,0.4) 0%, transparent 70%)",
                animation: "lanternGlow 1.8s ease-in-out infinite alternate",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKY BACKGROUND (progressive)
   ───────────────────────────────────────────────────────────── */
function Sky({ progress }) {
  const r = Math.round(10 + 5 * progress);
  const g = Math.round(15 + 65 * progress);
  const b = Math.round(12 + 40 * progress);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgb(${r},${g},${b})`,
        }}
      />
      {/* Radial warm glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, 
            rgba(0,${Math.round(120 + 80 * progress)},${Math.round(60 + 50 * progress)}, ${Math.min(0.35, progress * 0.55)}) 0%, 
            transparent 55%)`,
        }}
      />
      {/* Stars that fade as store opens */}
      {progress < 0.6 &&
        Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${5 + ((i * 37) % 40)}%`,
              left: `${3 + ((i * 53) % 94)}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "white",
              opacity: Math.max(0, (0.5 - progress) * (0.3 + (i % 3) * 0.2)),
              animation: `twinkle ${1.5 + (i % 4) * 0.5}s ease-in-out ${i * 0.3}s infinite alternate`,
            }}
          />
        ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS RING
   ───────────────────────────────────────────────────────────── */
function ProgressRing({ progress, totalSec }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const secs = Math.ceil((1 - progress) * totalSec);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const label = mins > 0 ? `${mins}:${String(s).padStart(2, "0")}` : `${secs}s`;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "5%",
        right: "4%",
        zIndex: 22,
        opacity: 0.5,
        pointerEvents: "none",
      }}
    >
      <svg width={60} height={60} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={30}
          cy={30}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={3}
        />
        <circle
          cx={30}
          cy={30}
          r={r}
          fill="none"
          stroke={C.emerald}
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s linear" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontSize: secs >= 100 ? 9 : 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'Helvetica Neue', monospace",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPARKLE PARTICLES
   ───────────────────────────────────────────────────────────── */
function Sparkles({ active, progress }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 16,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${20 + Math.random() * 60}%`,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: i % 3 === 0 ? C.gold : C.emerald,
            opacity: 0,
            animation: `sparkle ${1.5 + Math.random() * 2}s ease-in-out ${i * 0.4 + Math.random() * 3}s infinite`,
            boxShadow: `0 0 6px ${i % 3 === 0 ? C.gold : C.emerald}`,
          }}
        />
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN STORE ENTRANCE
   ═════════════════════════════════════════════════════════════ */
export default function StoreEntrance({
  store,
  children,
  durationSeconds = 20,
}) {
  const TOTAL_MS = durationSeconds * 1000;

  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  // Generate floating card configs
  const cards = useRef(
    Array.from({ length: 28 }, (_, i) => {
      const prod = PRODUCTS[i % PRODUCTS.length];
      const isWide = ["Shoes", "Shades", "Hat", "Fabric"].includes(prod.cat);
      return {
        product: prod,
        delay: 1.2 + (i / 28) * (durationSeconds - 5) + Math.random() * 2,
        duration: 5 + Math.random() * 5,
        left: `${1 + Math.random() * 98}%`,
        rotate: Math.floor(Math.random() * 20) - 10,
        w: isWide ? 85 + Math.random() * 20 : 68 + Math.random() * 15,
        h: isWide ? 60 + Math.random() * 15 : 85 + Math.random() * 20,
      };
    })
  );

  // Animation frame loop
  useEffect(() => {
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / TOTAL_MS, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [TOTAL_MS]);

  // Phase timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), TOTAL_MS - 1400),
      setTimeout(() => setFadeOut(true), TOTAL_MS - 800),
      setTimeout(() => setDone(true), TOTAL_MS + 700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [TOTAL_MS]);

  const skip = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase(3);
    setFadeOut(true);
    setTimeout(() => setDone(true), 800);
  }, []);

  const storeName = store?.name || "Zova Market";
  const gatesOpen = phase >= 2;
  const [skipHover, setSkipHover] = useState(false);

  return (
    <>
      <style>{`
        @keyframes cardRise {
          0%   { opacity:0; transform: translateY(0) scale(0.6) rotate(0deg); }
          6%   { opacity:1; }
          90%  { opacity:0.9; }
          100% { opacity:0; transform: translateY(-92vh) rotate(12deg) scale(1.02); }
        }
        @keyframes rayFlicker {
          from { opacity:0.5; } to { opacity:1; }
        }
        @keyframes lanternSwing {
          0%,100% { transform: rotate(-6deg); }
          50%     { transform: rotate(6deg); }
        }
        @keyframes lanternGlow {
          from { opacity:0.3; } to { opacity:0.8; }
        }
        @keyframes tasselSway {
          from { transform: rotate(-4deg); }
          to   { transform: rotate(4deg); }
        }
        @keyframes bounceDot {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-6px) scale(1.2); }
        }
        @keyframes glowBreath {
          0%,100% { opacity:0.4; } 50% { opacity:0.85; }
        }
        @keyframes twinkle {
          from { opacity:0.15; transform:scale(0.8); }
          to   { opacity:0.6; transform:scale(1.2); }
        }
        @keyframes sparkle {
          0%   { opacity:0; transform:scale(0) translateY(0); }
          20%  { opacity:1; transform:scale(1) translateY(-5px); }
          80%  { opacity:0.8; transform:scale(0.8) translateY(-20px); }
          100% { opacity:0; transform:scale(0) translateY(-30px); }
        }
        @keyframes archGlow {
          0%,100% { box-shadow: inset 0 0 20px rgba(0,184,107,0.12); }
          50%     { box-shadow: inset 0 0 50px rgba(0,184,107,0.3); }
        }
      `}</style>

      {!done && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            overflow: "hidden",
            opacity: fadeOut ? 0 : 1,
            transition: fadeOut ? "opacity 1.2s ease" : "none",
            fontFamily: "'Helvetica Neue', 'Segoe UI', sans-serif",
          }}
        >
          <Sky progress={progress} />

          {/* Ground glow */}
          {phase >= 2 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "3%",
                right: "3%",
                height: 120 + progress * 100,
                background: `radial-gradient(ellipse at 50% 100%, 
                  rgba(0,${Math.round(180 + progress * 75)},${Math.round(100 + progress * 40)},${0.18 + progress * 0.42}) 0%, 
                  transparent 65%)`,
                animation: "glowBreath 3.5s ease-in-out infinite",
                zIndex: 8,
              }}
            />
          )}

          {phase >= 2 && <Rays progress={progress} />}
          <Crowd visible={phase >= 2} />
          <Lanterns visible={phase >= 2} progress={progress} />
          <Sparkles active={phase >= 2} progress={progress} />

          {/* Floating product cards */}
          {phase >= 2 &&
            cards.current.map((c, i) => (
              <FloatingCard key={i} product={c.product} style={c} />
            ))}

          <Awning visible={phase >= 2} />
          <Banner name={storeName} visible={phase >= 1} />

          {/* ── Grand Archway ── */}
          <div
            style={{
              position: "absolute",
              top: "14%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(520px, 94vw)",
              height: "min(600px, 78vh)",
              zIndex: 9,
              pointerEvents: "none",
            }}
          >
            {/* Arch curve */}
            <div
              style={{
                position: "absolute",
                top: -2,
                left: -2,
                right: -2,
                height: "30%",
                border: `5px solid ${C.emeraldDark}`,
                borderBottom: "none",
                borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                zIndex: 12,
                animation: "archGlow 4s ease-in-out infinite",
              }}
            >
              {/* Keystone badge */}
              <div
                style={{
                  position: "absolute",
                  top: "32%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 58,
                  height: 34,
                  background: C.emeraldDark,
                  border: `3px solid ${C.gold}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 ${12 + progress * 24}px rgba(245,183,49,${0.3 + progress * 0.5})`,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: C.gold,
                    letterSpacing: "0.12em",
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  ZOVA
                </span>
              </div>
            </div>

            {/* Columns */}
            {["left", "right"].map((side) => (
              <div
                key={side}
                style={{
                  position: "absolute",
                  top: "28%",
                  [side]: -8,
                  width: 16,
                  bottom: 0,
                  zIndex: 12,
                  background: `linear-gradient(to ${side === "left" ? "right" : "left"}, 
                    #041F15, ${C.emeraldDark} 40%, #059669)`,
                  border: `2px solid ${C.emeraldDark}`,
                  borderRadius: "2px 2px 0 0",
                }}
              >
                {/* Column grooves */}
                {[20, 40, 60, 80].map((pct) => (
                  <div
                    key={pct}
                    style={{
                      position: "absolute",
                      top: `${pct}%`,
                      left: 0,
                      right: 0,
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
                {/* Column cap */}
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    left: -3,
                    right: -3,
                    height: 8,
                    background: C.emeraldDark,
                    borderRadius: 2,
                    border: `1px solid rgba(245,183,49,0.2)`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Gate Doors ── */}
          <div
            style={{
              position: "absolute",
              top: "calc(14% + min(600px,78vh) * 0.28 + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(504px, 91.5vw)",
              height: "min(430px, 56vh)",
              zIndex: 10,
              overflow: "hidden",
            }}
          >
            <Gate side="left" open={gatesOpen} />
            <Gate side="right" open={gatesOpen} />
            {/* Interior glow */}
            {phase >= 2 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 5,
                  pointerEvents: "none",
                  background: `radial-gradient(ellipse at 50% 35%, 
                    rgba(0,${Math.round(180 + progress * 75)},${Math.round(100 + progress * 40)},${0.12 + progress * 0.35}) 0%, 
                    transparent 60%)`,
                }}
              />
            )}
          </div>

          {phase >= 2 && (
            <ProgressRing
              progress={progress}
              totalSec={durationSeconds}
            />
          )}

          {/* Skip button */}
          {phase >= 2 && (
            <button
              type="button"
              onClick={skip}
              onMouseEnter={() => setSkipHover(true)}
              onMouseLeave={() => setSkipHover(false)}
              style={{
                position: "absolute",
                bottom: "5%",
                left: "4%",
                zIndex: 22,
                padding: "9px 22px",
                borderRadius: 100,
                border: `1px solid rgba(255,255,255,${skipHover ? 0.45 : 0.18})`,
                background: skipHover
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(255,255,255,0.05)",
                color: `rgba(255,255,255,${skipHover ? 0.85 : 0.4})`,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.25s",
                backdropFilter: "blur(6px)",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            >
              Skip →
            </button>
          )}

          {/* Entering indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              opacity: phase >= 2 ? 1 : 0,
              transition: "opacity 0.6s ease 1.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: C.emerald,
                      animation: `bounceDot 0.9s ease-in-out ${i * 0.18}s infinite`,
                      boxShadow: `0 0 ${5 + progress * 10}px ${C.emerald}`,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: `rgba(255,255,255,${0.35 + progress * 0.45})`,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "'Helvetica Neue', sans-serif",
                }}
              >
                Exploring {storeName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Store content behind */}
      <div
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.1s ease, transform 1.1s ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
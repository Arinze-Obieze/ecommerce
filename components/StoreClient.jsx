"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUser, FiStar, FiPackage, FiCheckCircle, FiMapPin,
  FiTrendingUp, FiMessageCircle, FiShare2, FiGrid, FiChevronDown,
} from "react-icons/fi";
import ProductGrid from "./Shop/ProductGrid";

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const T = {
  green:          "#00B86B",
  greenDark:      "#0F7A4F",
  greenDeep:      "#0A3D2E",
  greenTint:      "#EDFAF3",
  greenBorder:    "#A8DFC4",
  white:          "#FFFFFF",
  pageBg:         "#F4F6F4",
  charcoal:       "#0E0E0E",
  medGray:        "#5A5A5A",
  mutedText:      "#9A9A9A",
  border:         "#E4E8E4",
  softGray:       "#F0F2F0",
  starYellow:     "#F59E0B",
  starBg:         "#FFFBEB",
  trendingText:   "#EA580C",
  trendingBg:     "#FFF7ED",
  trendingBorder: "#FED7AA",
  // entrance palette
  E_bg:           "#050C07",
  E_bgMid:        "#08140A",
  E_panelL:       "#0A1C10",
  E_panelR:       "#091A0E",
  E_border:       "rgba(0,184,107,0.16)",
  E_borderHi:     "rgba(0,184,107,0.42)",
  E_white:        "#F0F7F2",
  E_dim:          "rgba(240,247,242,0.32)",
};

// ═════════════════════════════════════════════════════════════
// ENTRANCE OVERLAY — refined, professional
// ═════════════════════════════════════════════════════════════

function GrainSVG() {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:30, opacity:0.028, pointerEvents:"none", mixBlendMode:"overlay" }}>
      <filter id="grain-e">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-e)"/>
    </svg>
  );
}

function GridLines() {
  return (
    <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none" }}>
      {[33.33, 66.66].map(p => (
        <div key={`v${p}`} style={{ position:"absolute", top:0, bottom:0, left:`${p}%`, width:1, background:"rgba(0,184,107,0.04)" }}/>
      ))}
      {[33.33, 66.66].map(p => (
        <div key={`h${p}`} style={{ position:"absolute", left:0, right:0, top:`${p}%`, height:1, background:"rgba(0,184,107,0.04)" }}/>
      ))}
    </div>
  );
}

function CornerMarks({ show }) {
  const SIZE = 20;
  const W = 1.5;
  const corners = [
    { top:"5%",    left:"4%",   borderTop:`${W}px solid ${T.E_borderHi}`, borderLeft:`${W}px solid ${T.E_borderHi}` },
    { top:"5%",    right:"4%",  borderTop:`${W}px solid ${T.E_borderHi}`, borderRight:`${W}px solid ${T.E_borderHi}` },
    { bottom:"5%", left:"4%",   borderBottom:`${W}px solid ${T.E_borderHi}`, borderLeft:`${W}px solid ${T.E_borderHi}` },
    { bottom:"5%", right:"4%",  borderBottom:`${W}px solid ${T.E_borderHi}`, borderRight:`${W}px solid ${T.E_borderHi}` },
  ];
  return corners.map((c, i) => (
    <div key={i} style={{ position:"absolute", ...c, width:SIZE, height:SIZE, zIndex:25, opacity: show ? 1 : 0, transition:`opacity 0.7s ease ${0.15 + i * 0.07}s` }}/>
  ));
}

function TopBar({ show, storeName }) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, right:0, height:54, zIndex:28,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 5%",
      borderBottom:`1px solid ${T.E_border}`,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-8px)",
      transition:"opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
    }}>
      {/* Wordmark */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:22, height:22, borderRadius:5, border:`1.5px solid ${T.green}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:9, height:9, borderRadius:2, background:T.green }}/>
        </div>
        <span style={{ fontSize:14, fontWeight:900, color:T.E_white, letterSpacing:"0.14em", fontFamily:"'Georgia', serif", textTransform:"uppercase" }}>
          ZOVA
        </span>
      </div>
      {/* Store name (small) */}
      <span style={{ fontSize:10, fontWeight:600, color:T.E_dim, letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
        {storeName}
      </span>
      {/* Right: location */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:10, fontWeight:600, color:T.E_dim, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
          Onitsha Main Market
        </span>
        <div style={{ width:1, height:14, background:T.E_border }}/>
        <span style={{ fontSize:10, fontWeight:600, color:T.E_dim, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
          Nigeria
        </span>
      </div>
    </div>
  );
}

function CentreLockup({ storeName, show, fading }) {
  return (
    <div style={{
      position:"absolute", top:"50%", left:"50%",
      transform:"translate(-50%, -50%)",
      zIndex:28, textAlign:"center", pointerEvents:"none",
      width:"90%", maxWidth:520,
      opacity: fading ? 0 : (show ? 1 : 0),
      transition: fading ? "opacity 0.8s ease" : "opacity 1s ease 0.1s",
    }}>
      {/* Rule + label */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:18, opacity: show ? 1 : 0, transition:"opacity 1s ease 0.1s" }}>
        <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${T.E_borderHi})` }}/>
        <span style={{ fontSize:9, fontWeight:700, color:T.green, letterSpacing:"0.3em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
          Welcome to
        </span>
        <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${T.E_borderHi})` }}/>
      </div>

      {/* Store name */}
      <div style={{
        fontFamily:"'Georgia', 'Times New Roman', serif",
        fontSize:"clamp(46px, 9.5vw, 88px)",
        fontWeight:700, color:T.E_white,
        letterSpacing:"-0.015em", lineHeight:0.95,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(18px)",
        transition:"opacity 1.1s ease 0.25s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.25s",
      }}>
        {storeName}
      </div>

      {/* Underline sweep */}
      <div style={{
        width: show ? "100%" : "0%", height:1.5,
        background:`linear-gradient(to right, transparent 0%, ${T.green} 25%, ${T.green} 75%, transparent 100%)`,
        margin:"16px auto 0", maxWidth:300, borderRadius:1,
        transition:"width 1.2s cubic-bezier(0.77,0,0.175,1) 0.65s",
      }}/>

      {/* Sub-label */}
      <div style={{
        marginTop:14, fontSize:10, fontWeight:600, color:T.E_dim,
        letterSpacing:"0.24em", textTransform:"uppercase",
        fontFamily:"'Helvetica Neue', sans-serif",
        opacity: show ? 1 : 0, transition:"opacity 1s ease 0.85s",
      }}>
        Opening the store
      </div>
    </div>
  );
}

function GatePanel({ side, open }) {
  const isLeft = side === "left";
  return (
    <div style={{
      position:"absolute", top:0,
      [isLeft ? "left" : "right"]: 0,
      width:"50%", height:"100%",
      transformOrigin: isLeft ? "left center" : "right center",
      transform: open
        ? `perspective(2000px) rotateY(${isLeft ? "-" : ""}115deg)`
        : "perspective(2000px) rotateY(0deg)",
      transition:"transform 2.1s cubic-bezier(0.77, 0, 0.175, 1)",
      zIndex:20, overflow:"hidden", backfaceVisibility:"hidden", willChange:"transform",
    }}>
      {/* Base */}
      <div style={{ position:"absolute", inset:0, background: isLeft
        ? `linear-gradient(125deg, #030806 0%, ${T.E_panelL} 40%, #0E2416 70%, #060E08 100%)`
        : `linear-gradient(235deg, #030806 0%, ${T.E_panelR} 40%, #0C2013 70%, #060E08 100%)`
      }}/>
      {/* Vertical grain lines */}
      {Array.from({length:7},(_,i)=>(
        <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${i*14.3}%`, width:1, background:"rgba(0,184,107,0.022)" }}/>
      ))}
      {/* Outer inset frame */}
      <div style={{ position:"absolute", top:"4.5%", bottom:"4.5%", left:"6%", right:"6%", border:"1px solid rgba(0,184,107,0.1)", borderRadius:2 }}/>
      {/* Inner inset frame */}
      <div style={{ position:"absolute", top:"8%",  bottom:"8%",  left:"11%", right:"11%", border:"1px solid rgba(0,184,107,0.05)", borderRadius:2 }}/>
      {/* Top recessed panel */}
      <div style={{ position:"absolute", top:"11%", left:"14%", right:"14%", height:"26%", background:"rgba(0,0,0,0.14)", border:"1px solid rgba(0,184,107,0.07)", borderRadius:2 }}/>
      {/* Bottom recessed panel */}
      <div style={{ position:"absolute", top:"43%", bottom:"11%", left:"14%", right:"14%", background:"rgba(0,0,0,0.14)", border:"1px solid rgba(0,184,107,0.07)", borderRadius:2 }}/>
      {/* Mid rail */}
      <div style={{ position:"absolute", top:"41%", left:"8%", right:"8%", height:1.5, background:"rgba(0,184,107,0.09)" }}/>
      {/* Handle */}
      <div style={{
        position:"absolute",
        [isLeft ? "right" : "left"]: "17%",
        top:"50%", transform:"translateY(-50%)",
        width:8, height:44,
        background:"linear-gradient(180deg, #162A1C 0%, #0B1E11 50%, #162A1C 100%)",
        borderRadius:3.5,
        border:"1px solid rgba(0,184,107,0.22)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ width:2.5, height:22, borderRadius:1.5, background:"linear-gradient(180deg, rgba(0,184,107,0.45) 0%, rgba(0,184,107,0.85) 50%, rgba(0,184,107,0.45) 100%)", boxShadow:"0 0 5px rgba(0,184,107,0.25)" }}/>
      </div>
      {/* Edge depth shadow */}
      <div style={{ position:"absolute", inset:0, boxShadow: isLeft ? "inset -70px 0 90px rgba(0,0,0,0.55)" : "inset 70px 0 90px rgba(0,0,0,0.55)" }}/>
      {/* Hinge edge highlight */}
      <div style={{ position:"absolute", top:0, bottom:0, [isLeft?"left":"right"]:0, width:2, background:"rgba(0,184,107,0.1)" }}/>
    </div>
  );
}

function ArchFrame() {
  return (
    <div style={{
      position:"absolute", top:"11%", left:"50%", transform:"translateX(-50%)",
      width:"min(490px, 91vw)", height:"min(610px, 79vh)",
      zIndex:19, pointerEvents:"none",
    }}>
      <svg viewBox="0 0 490 125" style={{ position:"absolute", top:0, left:0, width:"100%", height:"20%", overflow:"visible" }}>
        <path d="M13,114 L13,62 Q13,-2 245,-2 Q477,-2 477,62 L477,114" fill="none" stroke="rgba(0,184,107,0.32)" strokeWidth="1.5"/>
        <path d="M0,122 L0,70 Q0,-14 245,-14 Q490,-14 490,70 L490,122" fill="none" stroke="rgba(0,184,107,0.08)" strokeWidth="1"/>
        {/* Keystone */}
        <rect x="221" y="-13" width="48" height="22" rx="2" fill="#08140A" stroke="rgba(0,184,107,0.46)" strokeWidth="1"/>
        <text x="245" y="5" textAnchor="middle" fill="rgba(0,184,107,0.65)" fontSize="7.5" fontFamily="'Helvetica Neue', sans-serif" fontWeight="800" letterSpacing="3.5">ZOVA</text>
      </svg>
      {/* Left pillar */}
      <div style={{ position:"absolute", left:0, top:"19%", bottom:0, width:13, background:"linear-gradient(to right, #020604, #0C1C10)", borderTop:"1.5px solid rgba(0,184,107,0.28)" }}>
        <div style={{ position:"absolute", top:-8, left:-3, right:-3, height:8, background:"#0A1A0D", borderTop:"1px solid rgba(0,184,107,0.36)" }}/>
      </div>
      {/* Right pillar */}
      <div style={{ position:"absolute", right:0, top:"19%", bottom:0, width:13, background:"linear-gradient(to left, #020604, #0C1C10)", borderTop:"1.5px solid rgba(0,184,107,0.28)" }}>
        <div style={{ position:"absolute", top:-8, left:-3, right:-3, height:8, background:"#0A1A0D", borderTop:"1px solid rgba(0,184,107,0.36)" }}/>
      </div>
    </div>
  );
}

function AmbientGlow({ progress }) {
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
      background:`radial-gradient(ellipse 55% 45% at 50% 54%, rgba(0,184,107,${0.05 + progress * 0.13}) 0%, transparent 68%)`,
    }}/>
  );
}

function ProgressBar({ progress }) {
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, zIndex:32, background:"rgba(0,184,107,0.07)" }}>
      <div style={{ height:"100%", width:`${progress * 100}%`, background:`linear-gradient(to right, ${T.greenDark}, ${T.green})`, transition:"width 0.4s linear", boxShadow:`0 0 7px ${T.green}` }}/>
    </div>
  );
}

function BottomRow({ show, storeName, onSkip }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      position:"absolute", bottom:22, left:"5%", right:"5%", zIndex:30,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      opacity: show ? 1 : 0, transition:"opacity 0.8s ease 1s",
    }}>
      {/* Pulse dot + label */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ position:"relative", width:8, height:8 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green, animation:"e_pulse 2s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green, opacity:0.3, animation:"e_ring 2s ease-in-out infinite" }}/>
        </div>
        <span style={{ fontSize:10, fontWeight:600, color:T.E_dim, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
          Entering {storeName}
        </span>
      </div>
      {/* Skip */}
      <button type="button" onClick={onSkip}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          padding:"7px 18px", borderRadius:2,
          border:`1px solid ${hov ? T.E_borderHi : T.E_border}`,
          background: hov ? "rgba(0,184,107,0.1)" : "transparent",
          color: hov ? T.E_white : T.E_dim,
          fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase",
          cursor:"pointer", transition:"all 0.18s",
          fontFamily:"'Helvetica Neue', sans-serif",
        }}
      >
        Enter now
      </button>
    </div>
  );
}

function StoreEntranceOverlay({ storeName, onDone }) {
  const TOTAL_MS = 5200;
  const [phase, setPhase]     = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    const tick = ts => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / TOTAL_MS, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setFadeOut(true), TOTAL_MS - 700),
      setTimeout(() => onDone(), TOTAL_MS + 300),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const skip = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setFadeOut(true);
    setTimeout(onDone, 650);
  }, []);

  return (
    <>
      <style>{`
        @keyframes e_pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(.85);opacity:.7} }
        @keyframes e_ring  { 0%{transform:scale(1);opacity:.3} 100%{transform:scale(2.6);opacity:0} }
      `}</style>
      <div style={{
        position:"fixed", inset:0, zIndex:9999, overflow:"hidden",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? "opacity 0.9s ease" : "none",
        background: T.E_bg,
        fontFamily:"'Helvetica Neue', 'Segoe UI', sans-serif",
      }}>
        <div style={{ position:"absolute", inset:0, zIndex:1, background:`radial-gradient(ellipse 75% 65% at 50% 50%, ${T.E_bgMid} 0%, ${T.E_bg} 100%)` }}/>
        <GridLines/>
        <GrainSVG/>
        <AmbientGlow progress={progress}/>

        {/* Interior glow (appears when gates open) */}
        {phase >= 2 && (
          <div style={{
            position:"absolute", top:"11%", left:"50%", transform:"translateX(-50%)",
            width:"min(490px,91vw)", height:"min(610px,79vh)",
            zIndex:7, pointerEvents:"none",
            background:"radial-gradient(ellipse 70% 55% at 50% 42%, rgba(0,184,107,0.09) 0%, transparent 65%)",
            animation:"fadeIn_e 1.2s ease both",
          }}/>
        )}
        {/* Floor reflection */}
        <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"min(490px,91vw)", height:70, zIndex:6, pointerEvents:"none", background:`linear-gradient(to top, rgba(0,184,107,${0.03 + progress * 0.07}) 0%, transparent 100%)` }}/>

        {/* Gate container */}
        <div style={{
          position:"absolute",
          top:"calc(11% + min(610px,79vh) * 0.19 + 12px)",
          left:"50%", transform:"translateX(-50%)",
          width:"min(464px, 87.5vw)", height:"min(496px, 64vh)",
          zIndex:20, overflow:"hidden",
        }}>
          <GatePanel side="left"  open={phase >= 2}/>
          <GatePanel side="right" open={phase >= 2}/>
        </div>

        <ArchFrame/>
        <CornerMarks show={phase >= 1}/>
        <TopBar show={phase >= 1} storeName={storeName}/>

        {/* Lockup fades when gates open */}
        <CentreLockup storeName={storeName} show={phase >= 1} fading={phase >= 2}/>

        <ProgressBar progress={progress}/>
        <BottomRow show={phase >= 2} storeName={storeName} onSkip={skip}/>

        <style>{`@keyframes fadeIn_e { from{opacity:0} to{opacity:1} }`}</style>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// STORE HEADER
// ═════════════════════════════════════════════════════════════

function Avatar({ store, size = 96 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:18, flexShrink:0, overflow:"hidden",
      border:`1.5px solid ${T.border}`, background:T.softGray,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:"0 2px 16px rgba(0,0,0,0.07)",
    }}>
      {store.logo_url
        ? <img src={store.logo_url} alt={store.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : <span style={{ fontSize:size * 0.38, fontWeight:900, color:T.green, fontFamily:"'Georgia', serif" }}>{store.name?.charAt(0).toUpperCase()}</span>
      }
    </div>
  );
}

function Pill({ children, variant = "neutral" }) {
  const v = {
    neutral: { bg:T.softGray,   text:T.medGray   },
    green:   { bg:T.greenTint,  text:T.greenDeep },
    star:    { bg:T.starBg,     text:"#92400E"   },
    trend:   { bg:T.trendingBg, text:T.trendingText },
  }[variant];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:100, fontSize:12, fontWeight:700, background:v.bg, color:v.text, border:`1px solid rgba(0,0,0,0.05)`, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function FollowBtn() {
  const [on, setOn] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={()=>setOn(o=>!o)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        height:40, padding:"0 22px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.16s",
        border: on ? `1.5px solid ${T.greenBorder}` : "none",
        background: on ? T.greenTint : hov ? T.greenDark : T.green,
        color: on ? T.greenDeep : T.white,
        letterSpacing:"-0.01em",
      }}
    >{on ? "✓ Following" : "+ Follow"}</button>
  );
}

function MsgBtn() {
  const [hov, setHov] = useState(false);
  return (
    <button type="button"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        height:40, padding:"0 18px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.16s",
        border:`1.5px solid ${T.border}`, background: hov ? T.softGray : T.white, color:T.charcoal,
        display:"flex", alignItems:"center", gap:7,
      }}
    ><FiMessageCircle size={14}/> Message</button>
  );
}

function ShareBtn({ store }) {
  const [hov, setHov]     = useState(false);
  const [ok, setOk]       = useState(false);
  const handle = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) { try { await navigator.share({ title:store.name, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(()=>setOk(false),1800); } catch {} }
  };
  return (
    <button type="button" onClick={handle}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        width:40, height:40, borderRadius:10, cursor:"pointer",
        border:`1.5px solid ${T.border}`, background: hov ? T.softGray : T.white,
        display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.14s", flexShrink:0,
      }}
    >
      {ok ? <span style={{ fontSize:11, fontWeight:800, color:T.green }}>✓</span> : <FiShare2 size={14} style={{ color:T.charcoal }}/>}
    </button>
  );
}

function VerifiedBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:T.green, padding:"3px 9px", borderRadius:100, background:T.greenTint, border:`1px solid ${T.greenBorder}` }}>
      <FiCheckCircle size={10}/> Verified
    </span>
  );
}

function TrendingBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:800, color:T.trendingText, padding:"3px 9px", borderRadius:100, background:T.trendingBg, border:`1px solid ${T.trendingBorder}` }}>
      <FiTrendingUp size={10}/> Trending
    </span>
  );
}

function StoreHeader({ store, productCount, loading }) {
  const rating    = Number(store.rating    || 4.8);
  const followers = Number(store.followers || 0);
  const reviews   = Number(store.reviews   || 0);
  const [descOpen, setDescOpen] = useState(false);
  const desc = store.description || "";
  const longDesc = desc.length > 120;

  return (
    <header style={{ background:T.white, borderBottom:`1px solid ${T.border}` }}>
      {/* Green awning stripe */}
      <div style={{ height:6, background:`repeating-linear-gradient(90deg, ${T.green} 0px, ${T.green} 20px, ${T.greenDeep} 20px, ${T.greenDeep} 40px)` }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 28px 0" }}>

        {/* Top row: avatar + info + actions */}
        <div style={{ display:"flex", gap:22, alignItems:"flex-start", flexWrap:"wrap", marginBottom:20 }}>
          <Avatar store={store}/>

          {/* Info block */}
          <div style={{ flex:1, minWidth:200 }}>
            {/* Name row */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:900, color:T.charcoal, margin:0, letterSpacing:"-0.03em", fontFamily:"'Georgia', serif" }}>
                {store.name}
              </h1>
              {store.kyc_status === "verified" && <VerifiedBadge/>}
              {store.is_trending && <TrendingBadge/>}
            </div>

            {/* Location */}
            {store.location && (
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                <FiMapPin size={11} style={{ color:T.mutedText }}/>
                <span style={{ fontSize:12, color:T.mutedText, fontWeight:500 }}>{store.location}</span>
              </div>
            )}

            {/* Description */}
            {desc && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:13, color:T.medGray, lineHeight:1.7, margin:0, maxWidth:500 }}>
                  {longDesc && !descOpen ? `${desc.slice(0, 120)}…` : desc}
                </p>
                {longDesc && (
                  <button type="button" onClick={()=>setDescOpen(o=>!o)} style={{ fontSize:12, color:T.green, fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", display:"flex", alignItems:"center", gap:3 }}>
                    {descOpen ? "Show less" : "Read more"}
                    <FiChevronDown size={12} style={{ transform: descOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}/>
                  </button>
                )}
              </div>
            )}

            {/* Stat pills */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              <Pill variant="star">
                <FiStar size={11} style={{ color:T.starYellow }}/> {rating.toFixed(1)} Rating
              </Pill>
              {reviews > 0 && (
                <Pill variant="neutral">
                  <FiMessageCircle size={11}/> {reviews.toLocaleString()} Reviews
                </Pill>
              )}
              <Pill variant="neutral">
                <FiUser size={11}/> {followers.toLocaleString()} Followers
              </Pill>
              <Pill variant="green">
                <FiPackage size={11}/> {loading ? "…" : productCount} Products
              </Pill>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, paddingTop:2 }}>
            <ShareBtn store={store}/>
            <MsgBtn/>
            <FollowBtn/>
          </div>
        </div>

        {/* Tab bar stub */}
        <div style={{ display:"flex", gap:0, borderTop:`1px solid ${T.border}`, marginLeft:-28, marginRight:-28, paddingLeft:28 }}>
          {["All Products", "Top Rated", "New Arrivals"].map((tab, i) => (
            <button key={tab} type="button" style={{
              padding:"12px 18px", fontSize:13, fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? T.green : T.medGray,
              background:"transparent", border:"none", cursor:"pointer",
              borderBottom: i === 0 ? `2px solid ${T.green}` : "2px solid transparent",
              marginBottom:-1, transition:"all 0.15s", letterSpacing:"-0.01em",
            }}>{tab}</button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════
export default function StoreClient({ store }) {
  const [entranceDone, setEntranceDone] = useState(false);
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(1);
  const [meta, setMeta]                 = useState(null);

  useEffect(() => {
    if (!store?.id) return;
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch(`/api/products?storeId=${store.id}&limit=20&page=${page}`);
        const data = await res.json();
        if (data.success) {
          setProducts(prev => page === 1 ? data.data : [...prev, ...data.data]);
          setMeta(data.meta?.pagination || null);
        } else {
          setError(data.error || "Failed to load products");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [store?.id, page]);

  return (
    <>
      {!entranceDone && (
        <StoreEntranceOverlay
          storeName={store?.name || "This Store"}
          onDone={() => setEntranceDone(true)}
        />
      )}

      <div style={{
        minHeight:"100vh",
        background:T.pageBg,
        opacity: entranceDone ? 1 : 0,
        transform: entranceDone ? "translateY(0)" : "translateY(14px)",
        transition:"opacity 0.7s ease, transform 0.7s ease",
      }}>
        <StoreHeader store={store} productCount={products.length} loading={loading}/>

        <main style={{ maxWidth:1200, margin:"0 auto", padding:"36px 28px 96px" }}>

          {/* Section header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:T.mutedText, margin:"0 0 4px", fontFamily:"'Helvetica Neue', sans-serif" }}>Browse</p>
              <h2 style={{ fontSize:20, fontWeight:900, color:T.charcoal, margin:0, letterSpacing:"-0.03em", fontFamily:"'Georgia', serif", display:"flex", alignItems:"center", gap:10 }}>
                All Products
                {!loading && products.length > 0 && (
                  <span style={{ fontSize:12, fontWeight:700, color:T.green, background:T.greenTint, padding:"2px 10px", borderRadius:100, border:`1px solid ${T.greenBorder}`, fontFamily:"'Helvetica Neue', sans-serif", letterSpacing:0 }}>
                    {products.length}
                  </span>
                )}
              </h2>
            </div>
            <FiGrid size={15} style={{ color:T.mutedText }}/>
          </div>

          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            meta={meta}
            onLoadMore={() => setPage(p => p + 1)}
          />
        </main>
      </div>
    </>
  );
}
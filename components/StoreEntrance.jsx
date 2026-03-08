"use client";
import { useState, useEffect, useRef } from "react";

const T = {
  green:    '#00B86B',
  greenDark:'#0F7A4F',
  greenDeep:'#0A3D2E',
  charcoal: '#111111',
  gold:     '#F59E0B',
};

// ── Real product photos from Unsplash (fashion/market items) ──
const PRODUCT_IMAGES = [
  // Dresses
  { url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=120&h=160&fit=crop&auto=format', label: 'dress' },
  { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=120&h=160&fit=crop&auto=format', label: 'dress' },
  { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=120&h=160&fit=crop&auto=format', label: 'dress' },
  // Bags / handbags
  { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop&auto=format', label: 'bag' },
  { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&h=120&fit=crop&auto=format', label: 'bag' },
  { url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=120&h=120&fit=crop&auto=format', label: 'bag' },
  // Shoes
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=140&h=100&fit=crop&auto=format', label: 'shoe' },
  { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=140&h=100&fit=crop&auto=format', label: 'shoe' },
  { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=140&h=100&fit=crop&auto=format', label: 'shoe' },
  // Jewellery / accessories
  { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=110&h=110&fit=crop&auto=format', label: 'jewel' },
  { url: 'https://images.unsplash.com/photo-1573408301185-9519f94815fe?w=110&h=110&fit=crop&auto=format', label: 'jewel' },
  // Sunglasses
  { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=130&h=90&fit=crop&auto=format', label: 'shades' },
  // Fabric / textile
  { url: 'https://images.unsplash.com/photo-1558171813-a2ffc849c8b4?w=120&h=100&fit=crop&auto=format', label: 'fabric' },
  // Watches
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=110&h=110&fit=crop&auto=format', label: 'watch' },
  // Hats
  { url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=120&h=100&fit=crop&auto=format', label: 'hat' },
  // Perfume
  { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=100&h=130&fit=crop&auto=format', label: 'perfume' },
];

// ── Floating product card particle ───────────────────────────
function ProductParticle({ image, style }) {
  return (
    <div style={{
      position: 'absolute',
      opacity: 0,
      animation: `floatUp ${style.duration}s ease-out ${style.delay}s forwards`,
      left: style.left,
      bottom: '-8%',
      pointerEvents: 'none',
      zIndex: 15,
      transform: `rotate(${style.rotate}deg)`,
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        width: style.w,
        height: style.h,
        backdropFilter: 'blur(4px)',
      }}>
        <img
          src={image.url}
          alt={image.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ── Gate panel ────────────────────────────────────────────────
function GatePanel({ side, phase }) {
  const isLeft  = side === 'left';
  const opening = phase >= 2;
  return (
    <div style={{
      position: 'absolute', top: 0,
      [isLeft ? 'left' : 'right']: 0,
      width: '50%', height: '100%',
      background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, #071a12 0%, #0A3D2E 30%, #0F7A4F 60%, #0A3D2E 100%)`,
      transformOrigin: isLeft ? 'left center' : 'right center',
      transform: opening
        ? `perspective(1400px) rotateY(${isLeft ? '-' : ''}100deg)`
        : 'perspective(1400px) rotateY(0deg)',
      transition: 'transform 1.6s cubic-bezier(0.77, 0, 0.175, 1)',
      zIndex: 10,
      boxShadow: isLeft ? '12px 0 60px rgba(0,0,0,0.7)' : '-12px 0 60px rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${8 + i * 9}%`, width: 1, background: 'rgba(255,255,255,0.04)' }} />
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 13}%`, height: 1, background: 'rgba(0,0,0,0.3)' }} />
      ))}
      <div style={{ position: 'absolute', top: '15%', bottom: '15%', left: isLeft ? '20%' : '10%', right: isLeft ? '10%' : '20%', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4 }} />
      <div style={{
        position: 'absolute', [isLeft ? 'right' : 'left']: '10%',
        top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <div style={{ width: 8, height: 4, borderRadius: 4, background: T.gold, boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />
        <div style={{ width: 8, height: 40, borderRadius: 4, background: `linear-gradient(to bottom, ${T.gold}, #B45309)` }} />
        <div style={{ width: 8, height: 4, borderRadius: 4, background: T.gold }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.08)', letterSpacing: '0.4em', textTransform: 'uppercase', transform: isLeft ? 'rotate(-90deg)' : 'rotate(90deg)' }}>
        ZOVA MARKET
      </span>
    </div>
  );
}

// ── Awning ────────────────────────────────────────────────────
function Awning({ phase }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 80, zIndex: 20, overflow: 'hidden',
      transform: phase >= 2 ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1s',
    }}>
      <div style={{ height: '100%', background: 'repeating-linear-gradient(90deg, #00B86B 0px, #00B86B 28px, #0A3D2E 28px, #0A3D2E 56px)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)' }} />
        <svg viewBox="0 0 600 36" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 36 }}>
          <path d="M0,0 Q20,36 40,0 Q60,36 80,0 Q100,36 120,0 Q140,36 160,0 Q180,36 200,0 Q220,36 240,0 Q260,36 280,0 Q300,36 320,0 Q340,36 360,0 Q380,36 400,0 Q420,36 440,0 Q460,36 480,0 Q500,36 520,0 Q540,36 560,0 Q580,36 600,0 L600,36 L0,36 Z" fill="#070F0B" />
        </svg>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 32, left: `${i * 5 + 2.5}%`, width: 2, height: 10, background: T.gold, borderRadius: 1, opacity: 0.7 }} />
        ))}
      </div>
    </div>
  );
}

// ── Welcome banner ────────────────────────────────────────────
function WelcomeBanner({ storeName, phase }) {
  return (
    <div style={{
      position: 'absolute', top: 84, left: '50%', transform: 'translateX(-50%)',
      zIndex: 25, textAlign: 'center', whiteSpace: 'nowrap',
      opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.6s ease 0.4s', pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 100, marginBottom: 0 }}>
        {[0,1].map(i => <div key={i} style={{ width: 2, height: 20, background: `linear-gradient(to bottom, rgba(0,0,0,0.4), ${T.gold})`, borderRadius: 1 }} />)}
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
        padding: '12px 40px 14px', borderRadius: 6, position: 'relative',
        boxShadow: '0 6px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}>
        <div style={{ position: 'absolute', left: -12, top: 0, bottom: 0, width: 12, background: '#B45309', clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
        <div style={{ position: 'absolute', right: -12, top: 0, bottom: 0, width: 12, background: '#B45309', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        <p style={{ fontSize: 10, fontWeight: 800, color: '#7C2D12', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 3px' }}>Welcome to</p>
        <p style={{ fontSize: 24, fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{storeName}</p>
      </div>
    </div>
  );
}

// ── Light rays — full width both sides ───────────────────────
function LightRays({ phase, progress }) {
  if (phase < 2) return null;
  const intensity = 0.1 + progress * 0.28;
  const warmR = 255, warmG = Math.round(200 + progress * 55), warmB = Math.round(50 + progress * 80);
  const fans = [
    { left: '28%', angles: [-75, -50, -25, -5, 15, 35] },
    { left: '72%', angles: [-35, -15, 5, 25, 50, 75] },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}>
      {fans.map((fan, fi) =>
        fan.angles.map((angle, i) => (
          <div key={`${fi}-${i}`} style={{
            position: 'absolute', top: '18%', left: fan.left,
            width: `${3 + i * 0.8}px`, height: '230%',
            background: `linear-gradient(to bottom, rgba(${warmR},${warmG},${warmB},${intensity}) 0%, rgba(${warmR},${warmG},${warmB},${intensity * 0.4}) 35%, transparent 65%)`,
            transformOrigin: 'top center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            animation: `rayPulse ${2.5 + (fi * 6 + i) * 0.25}s ease-in-out ${(fi * 6 + i) * 0.18}s infinite alternate`,
          }} />
        ))
      )}
    </div>
  );
}

// ── Crowd silhouettes ─────────────────────────────────────────
function CrowdSilhouettes({ phase }) {
  const shapes = [
    { left: '3%',  h: 95,  w: 30, delay: 0    },
    { left: '12%', h: 115, w: 34, delay: 0.1  },
    { left: '21%', h: 82,  w: 26, delay: 0.18 },
    { left: '30%', h: 105, w: 32, delay: 0.08 },
    { left: '62%', h: 98,  w: 29, delay: 0.12 },
    { left: '71%', h: 88,  w: 27, delay: 0.06 },
    { left: '80%', h: 118, w: 35, delay: 0.22 },
    { left: '89%', h: 76,  w: 25, delay: 0.15 },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6, pointerEvents: 'none' }}>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0, left: s.left, width: s.w, height: s.h,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.2))',
          borderRadius: `${s.w / 2}px ${s.w / 2}px 0 0`,
          opacity: phase >= 2 ? 0.7 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(40px)',
          transition: `opacity 0.6s ease ${0.9 + s.delay}s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) ${0.9 + s.delay}s`,
        }}>
          <div style={{ position: 'absolute', top: -s.w * 0.48, left: '50%', transform: 'translateX(-50%)', width: s.w * 0.7, height: s.w * 0.7, borderRadius: '50%', background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', top: '25%', left: '-30%', right: '-30%', height: s.w * 0.25, background: 'rgba(0,0,0,0.3)', borderRadius: s.w }} />
        </div>
      ))}
    </div>
  );
}

// ── Progressive sky ───────────────────────────────────────────
function ProgressiveSky({ progress }) {
  const r = Math.round(7  + 7  * progress);
  const g = Math.round(15 + 75 * progress);
  const b = Math.round(11 + 49 * progress);
  const tA = Math.min(1, progress * 2.2);
  const mA = Math.min(1, progress * 1.4);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgb(${r},${g},${b})` }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom,
          rgba(0,${Math.round(80 + 120 * progress)},${Math.round(40 + 60 * progress)}, ${tA * 0.55}) 0%,
          rgba(0,${Math.round(60 + 80 * progress)},${Math.round(30 + 40 * progress)}, ${mA * 0.3}) 35%,
          transparent 70%)`,
      }} />
      {progress > 0.35 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,${Math.round(140 + 44 * progress)},${Math.round(60 + 47 * progress)}, ${Math.min(0.38, (progress - 0.35) * 0.65)}) 0%, transparent 60%)`,
        }} />
      )}
    </div>
  );
}

// ── Countdown ring ────────────────────────────────────────────
function CountdownRing({ progress, phase, totalSeconds }) {
  if (phase < 2) return null;
  const r = 22, circ = 2 * Math.PI * r;
  const remaining = Math.ceil((1 - progress) * totalSeconds);
  return (
    <div style={{ position: 'absolute', bottom: '6%', right: '4%', zIndex: 22, opacity: 0.55, pointerEvents: 'none' }}>
      <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
        <circle cx={28} cy={28} r={r} fill="none" stroke={T.green} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
      </svg>
      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: remaining >= 100 ? 9 : 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>
        {remaining}s
      </span>
    </div>
  );
}

// ── Skip button ───────────────────────────────────────────────
function SkipButton({ onSkip, phase }) {
  const [hov, setHov] = useState(false);
  if (phase < 2) return null;
  return (
    <button type="button"
      onClick={onSkip}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', bottom: '6%', left: '4%', zIndex: 22,
        padding: '8px 18px', borderRadius: 100, border: `1px solid rgba(255,255,255,${hov ? 0.4 : 0.2})`,
        background: hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        color: `rgba(255,255,255,${hov ? 0.8 : 0.45})`,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)',
      }}
    >
      Skip →
    </button>
  );
}

// ── Lanterns ──────────────────────────────────────────────────
function Lanterns({ phase, progress }) {
  if (phase < 2) return null;
  return (
    <>
      {[8, 26, 74, 92].map((left, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${10 + (i % 2) * 7}%`, left: `${left}%`,
          zIndex: 18, animation: `lanternSway ${2.5 + i * 0.4}s ease-in-out infinite`,
          transformOrigin: 'top center', opacity: 0.35 + progress * 0.55,
        }}>
          <div style={{ width: 1, height: 20, background: T.gold, margin: '0 auto', opacity: 0.5 }} />
          <div style={{
            width: 20, height: 28,
            background: 'linear-gradient(to bottom, #DC2626, #991B1B)',
            borderRadius: '4px 4px 8px 8px', position: 'relative',
            boxShadow: `0 0 ${8 + progress * 20}px rgba(220,38,38,${0.4 + progress * 0.4})`,
          }}>
            <div style={{ position: 'absolute', top: '30%', left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', top: '55%', left: '15%', right: '15%', height: 1, background: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      ))}
    </>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
// durationSeconds prop — default 30, pass any value e.g. 60, 90, 120
export default function StoreEntrance({ store, children, durationSeconds = 1200 }) {
  const TOTAL_MS = durationSeconds * 1000;

  const [phase, setPhase]           = useState(0);
  const [done, setDone]             = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [progress, setProgress]     = useState(0);
  const startTime = useRef(null);
  const rafRef    = useRef(null);

  // Spread particles evenly over the full duration
  const SIZES = [
    { w: 80,  h: 105 },
    { w: 70,  h: 70  },
    { w: 90,  h: 65  },
    { w: 65,  h: 85  },
    { w: 75,  h: 95  },
  ];
  const particles = useRef(
    [...Array(36)].map((_, i) => {
      const img  = PRODUCT_IMAGES[i % PRODUCT_IMAGES.length];
      const size = SIZES[i % SIZES.length];
      return {
        image:    img,
        delay:    1.5 + (i / 36) * (durationSeconds - 6) + Math.random() * 3,
        duration: 5 + Math.random() * 6,
        left:     `${2 + Math.random() * 96}%`,
        rotate:   Math.floor(Math.random() * 26) - 13,
        w:        size.w,
        h:        size.h,
      };
    })
  );

  // RAF progress ticker
  useEffect(() => {
    const tick = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const p = Math.min((ts - startTime.current) / TOTAL_MS, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [TOTAL_MS]);

  // Phase timings — always relative to durationSeconds
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), TOTAL_MS - 1500);
    const t4 = setTimeout(() => setOverlayOpacity(0), TOTAL_MS - 900);
    const t5 = setTimeout(() => setDone(true), TOTAL_MS + 600);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, [TOTAL_MS]);

  const skip = () => {
    cancelAnimationFrame(rafRef.current);
    setPhase(3);
    setOverlayOpacity(0);
    setTimeout(() => setDone(true), 900);
  };

  const storeName = store?.name || 'This Store';

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.5); }
          8%   { opacity: 1; }
          88%  { opacity: 0.95; }
          100% { opacity: 0; transform: translateY(-90vh) rotate(18deg) scale(1.05); }
        }
        @keyframes rayPulse {
          from { opacity: 0.45; }
          to   { opacity: 1; }
        }
        @keyframes bounceDot {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-7px) scale(1.25); }
        }
        @keyframes shimmerGold {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1; }
        }
        @keyframes lanternSway {
          0%,100% { transform: rotate(-7deg); }
          50%     { transform: rotate(7deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.9; }
        }
      `}</style>

      {!done && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
          opacity: overlayOpacity, transition: overlayOpacity === 0 ? 'opacity 1.1s ease' : 'none',
        }}>
          <ProgressiveSky progress={progress} />

          {/* Ground glow */}
          {phase >= 2 && (
            <div style={{
              position: 'absolute', bottom: 0, left: '5%', right: '5%',
              height: `${100 + progress * 100}px`,
              background: `radial-gradient(ellipse at 50% 100%, rgba(0,${Math.round(184 + progress * 71)},${Math.round(107 + progress * 40)}, ${0.2 + progress * 0.45}) 0%, transparent 70%)`,
              animation: 'glowPulse 3s ease-in-out infinite', zIndex: 8,
            }} />
          )}

          <LightRays phase={phase} progress={progress} />
          <CrowdSilhouettes phase={phase} />
          <Lanterns phase={phase} progress={progress} />

          {/* Floating product images */}
          {phase >= 2 && particles.current.map((p, i) => (
            <ProductParticle key={i} image={p.image} style={p} />
          ))}

          <Awning phase={phase} />
          <WelcomeBanner storeName={storeName} phase={phase} />

          {/* Arch frame */}
          <div style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)', width: 'min(500px, 92vw)', height: 'min(580px, 76vh)', zIndex: 9, pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: -2, left: -2, right: -2, height: '32%',
              border: `5px solid ${T.greenDark}`, borderBottom: 'none',
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0', zIndex: 12,
              boxShadow: `inset 0 0 ${20 + progress * 40}px rgba(0,184,107,${0.1 + progress * 0.2})`,
            }}>
              <div style={{
                position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)',
                width: 54, height: 32, background: T.greenDeep, border: `3px solid ${T.gold}`,
                borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 ${8 + progress * 20}px rgba(245,158,11,${0.3 + progress * 0.5})`,
              }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: T.gold, letterSpacing: '0.1em', animation: 'shimmerGold 2s ease-in-out infinite' }}>ZOVA</span>
              </div>
            </div>
            {['left','right'].map(side => (
              <div key={side} style={{
                position: 'absolute', top: '30%', [side]: -6, width: 14, bottom: 0, zIndex: 12,
                background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, #071a12, #0A3D2E 40%, #0F7A4F)`,
                border: `2px solid ${T.greenDark}`,
              }}>
                {[25,50,75].map(pct => (
                  <div key={pct} style={{ position: 'absolute', top: `${pct}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            ))}
          </div>

          {/* Gate doors */}
          <div style={{
            position: 'absolute',
            top: 'calc(14% + min(580px,76vh) * 0.32)',
            left: '50%', transform: 'translateX(-50%)',
            width: 'min(488px, 90vw)', height: 'min(400px, 56vh)',
            zIndex: 10, overflow: 'hidden',
          }}>
            <GatePanel side="left"  phase={phase} />
            <GatePanel side="right" phase={phase} />
            {phase >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
                background: `radial-gradient(ellipse at 50% 35%, rgba(0,${Math.round(184 + progress * 71)},${Math.round(107 + progress * 40)}, ${0.15 + progress * 0.4}) 0%, transparent 65%)`,
              }} />
            )}
          </div>

          <CountdownRing progress={progress} phase={phase} totalSeconds={durationSeconds} />
          <SkipButton onSkip={skip} phase={phase} />

          {/* Entering label */}
          <div style={{
            position: 'absolute', bottom: '7%', left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.5s ease 1.5s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: `rgb(0,${Math.round(184 + progress * 71)},${Math.round(107 + progress * 40)})`,
                    animation: `bounceDot 0.9s ease-in-out ${i * 0.2}s infinite`,
                    boxShadow: `0 0 ${4 + progress * 8}px rgba(0,184,107,0.7)`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: `rgba(255,255,255,${0.4 + progress * 0.4})`, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Exploring {storeName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Store content */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 1s ease, transform 1s ease',
      }}>
        {children}
      </div>
    </>
  );
}
"use client";
import { useState, useEffect, useRef } from "react";
import {
  FiUser, FiStar, FiPackage, FiCheckCircle, FiMapPin,
  FiTrendingUp, FiMessageCircle, FiShare2, FiGrid,
} from "react-icons/fi";
import ProductGrid from "./Shop/ProductGrid";

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const T = {
  green:         '#00B86B',
  greenDark:     '#0F7A4F',
  greenDeep:     '#0A3D2E',
  greenTint:     '#EDFAF3',
  greenBorder:   '#A8DFC4',
  white:         '#FFFFFF',
  pageBg:        '#F9FAFB',
  charcoal:      '#111111',
  medGray:       '#666666',
  mutedText:     '#999999',
  border:        '#E8E8E8',
  softGray:      '#F5F5F5',
  starYellow:    '#F59E0B',
  starBg:        '#FFFBEB',
  trendingText:  '#EA580C',
  trendingBg:    '#FFF7ED',
  trendingBorder:'#FED7AA',
  gold:          '#F59E0B',
};

// ─────────────────────────────────────────────────────────────
// ENTRANCE ANIMATION COMPONENTS
// ─────────────────────────────────────────────────────────────
const PARTICLES = ['🛍️','👗','👠','💼','🧣','👒','🎀','✨','🌟','👜','💛','🧵'];

function Particle({ emoji, style }) {
  return (
    <span style={{
      position: 'absolute',
      fontSize: style.size,
      opacity: 0,
      animation: `floatUp ${style.duration}s ease-out ${style.delay}s forwards`,
      left: style.left,
      bottom: '-10%',
      userSelect: 'none',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      zIndex: 15,
    }}>
      {emoji}
    </span>
  );
}

function GatePanel({ side, phase }) {
  const isLeft  = side === 'left';
  const opening = phase >= 2;
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      [isLeft ? 'left' : 'right']: 0,
      width: '50%',
      height: '100%',
      background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, #0A3D2E 0%, #0F7A4F 50%, #0A3D2E 100%)`,
      transformOrigin: isLeft ? 'left center' : 'right center',
      transform: opening
        ? `perspective(1200px) rotateY(${isLeft ? '-' : ''}95deg)`
        : 'perspective(1200px) rotateY(0deg)',
      transition: 'transform 1.1s cubic-bezier(0.77, 0, 0.175, 1)',
      zIndex: 10,
      boxShadow: isLeft ? '8px 0 40px rgba(0,0,0,0.5)' : '-8px 0 40px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${10 + i * 11}%`, width: 1, background: 'rgba(255,255,255,0.05)' }} />
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 17}%`, height: 1, background: 'rgba(0,0,0,0.25)' }} />
      ))}
      <div style={{
        position: 'absolute',
        [isLeft ? 'right' : 'left']: '12%',
        top: '50%', transform: 'translateY(-50%)',
        width: 10, height: 48, borderRadius: 5,
        background: T.gold, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }} />
      <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.3em', textTransform: 'uppercase', transform: isLeft ? 'rotate(-90deg)' : 'rotate(90deg)' }}>
        ZOVA
      </span>
    </div>
  );
}

function Awning({ phase }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 70, zIndex: 20, overflow: 'hidden',
      transform: phase >= 2 ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.6s ease-out 0.8s',
    }}>
      <div style={{ height: '100%', background: 'repeating-linear-gradient(90deg, #00B86B 0px, #00B86B 32px, #0A3D2E 32px, #0A3D2E 64px)', position: 'relative' }}>
        <svg viewBox="0 0 400 30" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 30 }}>
          <path d="M0,0 Q25,30 50,0 Q75,30 100,0 Q125,30 150,0 Q175,30 200,0 Q225,30 250,0 Q275,30 300,0 Q325,30 350,0 Q375,30 400,0 L400,30 L0,30 Z" fill="#111111" />
        </svg>
      </div>
    </div>
  );
}

function WelcomeBanner({ storeName, phase }) {
  return (
    <div style={{
      position: 'absolute', top: 76, left: '50%', transform: 'translateX(-50%)',
      zIndex: 25, textAlign: 'center',
      opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.5s ease 0.3s', pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginBottom: 4 }}>
        {[0,1].map(i => <div key={i} style={{ width: 2, height: 16, background: T.gold, borderRadius: 1 }} />)}
      </div>
      <div style={{ background: T.gold, padding: '10px 32px 12px', borderRadius: 6, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', left: -10, top: 0, bottom: 0, width: 10, background: '#D97706', clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
        <div style={{ position: 'absolute', right: -10, top: 0, bottom: 0, width: 10, background: '#D97706', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        <p style={{ fontSize: 10, fontWeight: 800, color: '#92400E', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 2px' }}>Welcome to</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: T.charcoal, margin: 0, letterSpacing: '-0.02em', maxWidth: 280, lineHeight: 1.2 }}>{storeName}</p>
      </div>
    </div>
  );
}

function LightRays({ phase }) {
  if (phase < 2) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', top: '30%', left: '50%', width: 3, height: '180%',
          background: 'linear-gradient(to bottom, rgba(255,215,0,0.18), transparent)',
          transformOrigin: 'top center',
          transform: `rotate(${-60 + i * 24}deg)`,
          animation: `rayPulse 3s ease-in-out ${i * 0.3}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function CrowdSilhouettes({ phase }) {
  const shapes = [
    { left: '8%',  height: 90,  w: 28, delay: 0    },
    { left: '18%', height: 110, w: 32, delay: 0.1  },
    { left: '27%', height: 80,  w: 26, delay: 0.2  },
    { left: '68%', height: 100, w: 30, delay: 0.15 },
    { left: '77%', height: 88,  w: 27, delay: 0.05 },
    { left: '86%', height: 115, w: 33, delay: 0.25 },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6, pointerEvents: 'none' }}>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0, left: s.left, width: s.w, height: s.height,
          background: 'rgba(0,0,0,0.35)', borderRadius: `${s.w / 2}px ${s.w / 2}px 0 0`,
          opacity: phase >= 2 ? 0.6 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(30px)',
          transition: `opacity 0.5s ease ${0.8 + s.delay}s, transform 0.5s ease ${0.8 + s.delay}s`,
        }}>
          <div style={{
            position: 'absolute', top: -s.w * 0.45, left: '50%', transform: 'translateX(-50%)',
            width: s.w * 0.65, height: s.w * 0.65, borderRadius: '50%', background: 'rgba(0,0,0,0.35)',
          }} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ENTRANCE OVERLAY
// ─────────────────────────────────────────────────────────────
function StoreEntranceOverlay({ storeName, onDone }) {
  const [phase, setPhase]     = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const particles = useRef(
    [...Array(18)].map((_, i) => ({
      emoji:    PARTICLES[i % PARTICLES.length],
      delay:    0.2 + Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.5,
      left:     `${5 + Math.random() * 90}%`,
      size:     `${16 + Math.random() * 20}px`,
    }))
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1100);
    const t3 = setTimeout(() => setPhase(3), 2900);
    const t4 = setTimeout(() => setOverlayOpacity(0), 3100);
    const t5 = setTimeout(() => onDone(), 3900);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.8); }
          15%  { opacity: 1; }
          85%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-70vh) rotate(20deg) scale(1.1); }
        }
        @keyframes rayPulse {
          from { opacity: 0.4; transform: scaleX(0.8); }
          to   { opacity: 1;   transform: scaleX(1.3); }
        }
        @keyframes groundGlow {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
        @keyframes bounceDot {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
        opacity: overlayOpacity,
        transition: overlayOpacity === 0 ? 'opacity 0.7s ease' : 'none',
        background: '#070F0B',
      }}>
        {/* Bg radial */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, #0F7A4F22 0%, #070F0B 70%)' }} />

        {/* Ground glow */}
        {phase >= 2 && (
          <div style={{
            position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 120,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(0,184,107,0.35) 0%, transparent 70%)',
            animation: 'groundGlow 2s ease-in-out infinite', zIndex: 8,
          }} />
        )}

        <LightRays phase={phase} />
        <CrowdSilhouettes phase={phase} />

        {/* Particles */}
        {phase >= 2 && particles.current.map((p, i) => (
          <Particle key={i} emoji={p.emoji} style={p} />
        ))}

        <Awning phase={phase} />
        <WelcomeBanner storeName={storeName} phase={phase} />

        {/* Arch frame */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(480px, 90vw)', height: 'min(560px, 75vh)',
          zIndex: 9, pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: -2, left: -2, right: -2, height: '30%',
            border: `4px solid ${T.greenDark}`, borderBottom: 'none',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0', zIndex: 12,
          }}>
            <div style={{
              position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%)',
              width: 48, height: 28, background: T.greenDeep, border: `3px solid ${T.gold}`,
              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: T.gold, letterSpacing: '0.1em' }}>ZOVA</span>
            </div>
          </div>
          {['left','right'].map(side => (
            <div key={side} style={{
              position: 'absolute', top: '28%', [side]: -4, width: 12, bottom: 0, zIndex: 12,
              background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, #0A3D2E, #0F7A4F)`,
              border: `2px solid ${T.greenDark}`,
            }} />
          ))}
        </div>

        {/* Gate doors */}
        <div style={{
          position: 'absolute',
          top: 'calc(15% + min(560px,75vh) * 0.30)',
          left: '50%', transform: 'translateX(-50%)',
          width: 'min(468px, 88vw)', height: 'min(395px, 55vh)',
          zIndex: 10, overflow: 'hidden',
        }}>
          <GatePanel side="left"  phase={phase} />
          <GatePanel side="right" phase={phase} />
          {phase >= 2 && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 40%, rgba(0,184,107,0.22) 0%, transparent 70%)',
            }} />
          )}
        </div>

        {/* Entering label */}
        <div style={{
          position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, textAlign: 'center',
          opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.5s ease 1.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: T.green,
                  animation: `bounceDot 0.9s ease-in-out ${i * 0.18}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Entering store
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// STORE UI COMPONENTS
// ─────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, variant = "neutral" }) {
  const styles = {
    neutral: { bg: T.softGray,  text: T.medGray,  icon: T.mutedText  },
    rating:  { bg: T.starBg,    text: T.charcoal, icon: T.starYellow },
    green:   { bg: T.greenTint, text: T.greenDeep,icon: T.green      },
  }[variant];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: styles.bg, flexShrink: 0 }}>
      <Icon size={12} style={{ color: styles.icon }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: styles.text }}>{value}</span>
      <span style={{ fontSize: 12, color: T.mutedText }}>{label}</span>
    </div>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  const [hov, setHov]             = useState(false);
  return (
    <button type="button"
      onClick={() => setFollowing(f => !f)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '10px 22px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
        border: following ? `1.5px solid ${T.greenBorder}` : 'none',
        background: following ? T.greenTint : hov ? T.greenDark : T.green,
        color: following ? T.greenDeep : T.white,
      }}
    >
      {following ? '✓ Following' : '+ Follow'}
    </button>
  );
}

function MessageButton() {
  const [hov, setHov] = useState(false);
  return (
    <button type="button"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
        borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
        border: `1.5px solid ${T.border}`, background: hov ? T.softGray : T.white, color: T.charcoal,
      }}
    >
      <FiMessageCircle size={14} /> Message
    </button>
  );
}

function ShareButton({ store }) {
  const [hov, setHov]     = useState(false);
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: store.name, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    }
  };
  return (
    <button type="button" onClick={handleShare}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 42, height: 42, borderRadius: 10, cursor: 'pointer',
        border: `1.5px solid ${T.border}`, background: hov ? T.softGray : T.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0,
      }}
    >
      {copied
        ? <span style={{ fontSize: 11, fontWeight: 800, color: T.green }}>✓</span>
        : <FiShare2 size={15} style={{ color: T.charcoal }} />
      }
    </button>
  );
}

function StoreHeader({ store, productCount, loading }) {
  const rating    = Number(store.rating    || 4.8);
  const followers = Number(store.followers || 0);

  return (
    <div style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
      {/* Awning strip */}
      <div style={{ height: 8, background: `repeating-linear-gradient(90deg, ${T.green} 0px, ${T.green} 24px, ${T.greenDeep} 24px, ${T.greenDeep} 48px)` }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 24px' }} className="sm:px-6 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

          {/* Logo */}
          <div style={{
            width: 100, height: 100, borderRadius: 20, flexShrink: 0, overflow: 'hidden',
            border: `2px solid ${T.border}`, background: T.softGray,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 36, fontWeight: 900, color: T.green }}>{store.name?.charAt(0).toUpperCase()}</span>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: T.charcoal, margin: 0, letterSpacing: '-0.025em' }}>
                {store.name}
              </h1>
              {store.kyc_status === 'verified' && (
                <FiCheckCircle size={16} style={{ color: T.green, flexShrink: 0 }} title="Verified" />
              )}
              {store.is_trending && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 100,
                  background: T.trendingBg, color: T.trendingText, border: `1px solid ${T.trendingBorder}`,
                }}>
                  <FiTrendingUp size={10} /> Trending
                </span>
              )}
            </div>

            {store.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <FiMapPin size={11} style={{ color: T.mutedText }} />
                <span style={{ fontSize: 12, color: T.mutedText }}>{store.location}</span>
              </div>
            )}

            {store.description && (
              <p className="line-clamp-2" style={{ fontSize: 13, color: T.medGray, margin: '0 0 12px', maxWidth: 520, lineHeight: 1.65 }}>
                {store.description}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <StatPill icon={FiStar}    value={rating.toFixed(1)} label="Rating"    variant="rating"  />
              <StatPill icon={FiUser}    value={followers.toLocaleString()} label="Followers" variant="neutral" />
              <StatPill icon={FiPackage} value={loading ? '…' : productCount} label="Products" variant="green" />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <ShareButton store={store} />
            <MessageButton />
            <FollowButton />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
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
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, [store?.id, page]);

  return (
    <>
      {/* Entrance animation — auto-plays, unmounts itself when done */}
      {!entranceDone && (
        <StoreEntranceOverlay
          storeName={store?.name || 'This Store'}
          onDone={() => setEntranceDone(true)}
        />
      )}

      {/* Store content — fades in as entrance fades out */}
      <div style={{
        minHeight: '100vh',
        background: T.pageBg,
        opacity: entranceDone ? 1 : 0,
        transform: entranceDone ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <StoreHeader store={store} productCount={products.length} loading={loading} />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }} className="sm:px-6 lg:px-8">
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.mutedText, margin: '0 0 3px' }}>Browse</p>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: T.charcoal, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                All Products
                {!loading && products.length > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.green, background: T.greenTint, padding: '2px 10px', borderRadius: 100, border: `1px solid ${T.greenBorder}` }}>
                    {products.length}
                  </span>
                )}
              </h2>
            </div>
            <FiGrid size={16} style={{ color: T.mutedText }} />
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
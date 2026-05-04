"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiChevronRight, FiShield, FiTruck, FiCheck, FiStar } from 'react-icons/fi';
import { getHeroBanner } from '@/features/storefront/home/api/client';

/* ─────────────────────────────────────────
   Static mood data
───────────────────────────────────────── */
const HERO_MOOD = {
  title: 'Owambe Vibes',
  subtitle: 'Dress loud, step out right',
  label: 'Party',
  link: '/mood/owambe',
  image: '/images/mood/ankara_owambe.jpeg',
};

const SIDE_MOODS = [
  {
    title: 'Casual & Chill',
    subtitle: 'Easy everyday looks',
    label: 'Everyday',
    link: '/mood/casual_chill',
    image: '/images/mood/casual_mood.jpeg',
  },
  {
    title: 'Office Ready',
    subtitle: 'Clean workday looks',
    label: 'Work',
    link: '/mood/office_ready',
    image: '/images/mood/office_wear.jpeg',
  },
];

const CHIP_MOODS = [
  { title: 'Date Night',       label: 'Night Out', link: '/mood/date_night',     image: '/images/mood/date_nghts.jpeg' },
  { title: 'Sunday Best',      label: 'Sunday',    link: '/mood/sunday_best',    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=75' },
  { title: 'Street Style',     label: 'Trendy',    link: '/mood/street_trendy',  image: '/images/mood/street_wear.jpeg' },
  { title: 'Soft Luxury',      label: 'Elevated',  link: '/mood/soft_luxury',    image: '/images/mood/soft_luxary.jpeg' },
  { title: 'Travel & Weekend', label: 'Outing',    link: '/mood/travel_weekend', image: '/images/mood/travel_weekend_mood.jpeg' },
];

const MARQUEE_ITEMS = [
  { icon: '🛡️', text: 'Buyer Protection on Every Order' },
  { icon: '✅', text: 'Assured Delivery' },
  { icon: '✓',  text: 'Verified African Stores' },
  { icon: '💳', text: 'Secure Payment Methods' },
  { icon: '🔄', text: 'Easy Returns & Refunds' },
  { icon: '📦', text: 'Track Your Orders Live' },
];

const overlay = 'linear-gradient(to bottom, rgba(0,0,0,0) 15%, rgba(0,0,0,0.82) 100%)';
const overlayStrong = 'linear-gradient(160deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.85) 100%)';

/* ── Premium Pill ── */
const Pill = ({ label, small = false, accent = false }) => (
  <span style={{
    display: 'inline-block',
    fontSize: small ? 9 : 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: small ? '2px 8px' : '3px 10px',
    borderRadius: 20,
    marginBottom: small ? 4 : 7,
    background: accent
      ? 'linear-gradient(135deg, rgba(46,100,23,0.92), rgba(56,120,28,0.88))'
      : 'rgba(255,255,255,0.18)',
    color: '#fff',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    boxShadow: accent ? '0 2px 12px rgba(46,100,23,0.4)' : 'none',
  }}>{label}</span>
);

/* ── Left tall card ── */
const HeroMoodCard = () => (
  <Link href={HERO_MOOD.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block', height: '100%',
    borderRadius: 20, overflow: 'hidden', textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  }}>
    <Image src={HERO_MOOD.image} alt={HERO_MOOD.title} fill className="mood-img"
      sizes="33vw" priority
      style={{ objectFit: 'cover', transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlayStrong }} />
    {/* Decorative top-right accent */}
    <div style={{
      position: 'absolute', top: 14, right: 14,
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <FiStar size={14} color="rgba(255,255,255,0.85)" />
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px', zIndex: 1 }}>
      <Pill label={HERO_MOOD.label} accent />
      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 6, letterSpacing: '-0.01em' }}>{HERO_MOOD.title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 16, lineHeight: 1.4 }}>{HERO_MOOD.subtitle}</div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #2E6417, #3a7a1e)',
        boxShadow: '0 4px 16px rgba(46,100,23,0.45)',
        color: '#fff', borderRadius: 28,
        padding: '9px 18px', fontSize: 12, fontWeight: 800,
        letterSpacing: '0.02em',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}>Shop now <FiArrowRight size={12} /></span>
    </div>
  </Link>
);

/* ── Right stacked card ── */
const SideMoodCard = ({ mood }) => (
  <Link href={mood.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block', flex: 1, minHeight: 0,
    borderRadius: 18, overflow: 'hidden', textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
  }}>
    <Image src={mood.image} alt={mood.title} fill className="mood-img"
      sizes="33vw" priority
      style={{ objectFit: 'cover', transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlayStrong }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 15px', zIndex: 1 }}>
      <Pill label={mood.label} />
      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 3, letterSpacing: '-0.01em' }}>{mood.title}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>{mood.subtitle}</div>
    </div>
    {/* Arrow indicator */}
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: 28, height: 28, borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
    }}>
      <FiArrowRight size={11} color="#fff" />
    </div>
  </Link>
);

/* ── Bottom chip card ── */
const ChipMoodCard = ({ mood }) => (
  <Link href={mood.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block',
    minWidth: 114, width: 114, height: 142,
    borderRadius: 16, overflow: 'hidden',
    flexShrink: 0, scrollSnapAlign: 'start', textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  }}>
    <Image src={mood.image} alt={mood.title} fill className="mood-img"
      sizes="114px" loading="eager"
      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 11px', zIndex: 1 }}>
      <Pill label={mood.label} small />
      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{mood.title}</div>
    </div>
  </Link>
);

/* ══════════════════════════════════
   CENTER BANNER BACKGROUND
══════════════════════════════════ */
const FALLBACK_BG = '/images/mood/discovery_style_card.jpeg';

const CenterBannerBg = ({ banner }) => {
  const [src, setSrc] = useState(banner?.background_image || FALLBACK_BG);
  return (
    <>
      <Image src={src} alt="" fill priority
        sizes="(max-width: 1024px) 100vw, 62vw"
        onError={() => setSrc(FALLBACK_BG)}
        style={{ objectFit: 'cover', objectPosition: 'center' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.72) 100%)' }} />
    </>
  );
};

/* ══════════════════════════════════
   HERO
══════════════════════════════════ */
const Hero = ({ initialBanner = null, initialSellerCount = null }) => {
  const [banner, setBanner]           = useState(initialBanner);
  const [sellerCount, setSellerCount] = useState(
    typeof initialSellerCount === 'number' ? initialSellerCount : 0
  );
  const [expanded, setExpanded]       = useState(false);

  useEffect(() => {
    const hasInitialBanner = Boolean(initialBanner);
    const hasInitialSellerCount = typeof initialSellerCount === 'number';
    if (hasInitialBanner && hasInitialSellerCount) return undefined;

    let active = true;

    (async () => {
      try {
        const data = await getHeroBanner();
        if (!hasInitialBanner && data.banner?.length > 0) {
          const b = data.banner[0];
          if (active) {
            setBanner({ ...b, background_image: b.background_image || b.backgroundImage });
          }
        }
        if (!hasInitialSellerCount && active && data.sellerStats) {
          setSellerCount(data.sellerStats.count || 0);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [initialBanner, initialSellerCount]);

  const formatCount = (n) => {
    if (n >= 10000) return Math.floor(n / 1000) + 'K+';
    if (n >= 1000)  return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K+';
    if (n > 0)      return n.toLocaleString() + '+';
    return '';
  };

  return (
    <div className="w-full" style={{ background: 'radial-gradient(circle at top right, rgba(236, 156, 0, 0.08), transparent 24%), linear-gradient(180deg, #fbf8f1 0%, #f5f1ea 100%)' }}>
      <style jsx global>{`
        .mood-img-zoom:hover .mood-img { transform: scale(1.06); }
        .mood-img-zoom:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.28) !important; }
        .mood-img-zoom { transition: box-shadow 0.35s ease; }
        .chips-row::-webkit-scrollbar  { display: none; }
        .chips-row { -ms-overflow-style: none; scrollbar-width: none; }
        .hero-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(46,100,23,0.5) !important; }
        .hero-cta-ghost:hover { background: rgba(255,255,255,0.22) !important; }
        @keyframes marquee  { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.85); } }
        @keyframes floatBadge { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-3px); } }
        .live-badge { animation: floatBadge 3s ease-in-out infinite; }
        .expand-btn:hover { border-color: var(--zova-primary-action) !important; color: var(--zova-primary-action) !important; }
      `}</style>

      <div className="w-full pt-3 pb-3">

        {/* ── Header row ── */}
        <div className="zova-shell flex items-center justify-between mb-3">
          <div className="flex flex-col gap-1.5">
            <span className="zova-eyebrow self-start">Curated discovery</span>
            <h2 className="zova-title text-[1.35rem] font-black">Shop by mood</h2>
          </div>
          <Link href="/mood" className="text-[12px] font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1 shrink-0">
            See all moods <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── Desktop 3-column grid ── */}
        <div className="hidden lg:grid gap-2.5" style={{ gridTemplateColumns: '1fr 1.85fr 1fr', height: 500 }}>

          {/* Left — Owambe hero mood card */}
          <HeroMoodCard />

          {/* Center — main banner (massively improved) */}
          <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}>
            <CenterBannerBg banner={banner} />

            <div className="absolute inset-0 flex flex-col justify-between p-8 xl:p-10">
              {/* Top section */}
              <div className="flex items-start justify-between">
                {/* Live badge */}
                <div className="live-badge inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/12 text-white/95 border border-white/20 backdrop-blur-md w-fit"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulseDot 2s ease infinite', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
                  New on Zova
                </div>
                {/* Stats pill */}
                {sellerCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                    <FiShield size={10} className="text-yellow-400" />
                    {formatCount(sellerCount)} stores
                  </div>
                )}
              </div>

              {/* Center content */}
              <div>
                {/* Eyebrow */}
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(100,200,80,0.95)',
                  marginBottom: 10,
                }}>
                  ✦ Fashion Marketplace
                </div>

                {/* Title — massive and bold */}
                <h1 style={{
                  fontSize: 'clamp(2rem, 3.2vw, 3rem)',
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1.02,
                  letterSpacing: '-0.03em',
                  marginBottom: 14,
                  maxWidth: 420,
                }}>
                  {banner?.title || (
                    <>Discover Your<br />
                    <span style={{
                      background: 'linear-gradient(135deg, #5db83a, #8be060)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>Perfect Style</span></>
                  )}
                </h1>

                {/* Subtitle */}
                <p style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: 13,
                  lineHeight: 1.65,
                  marginBottom: 24,
                  maxWidth: 300,
                }}>
                  {banner?.subtitle || 'Shop the latest fashion from trusted African stores'}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3 mb-7">
                  <Link href={banner?.cta_link || '/shop'}
                    className="hero-cta-primary group inline-flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #2E6417, #3a7a1e)',
                      color: '#fff',
                      borderRadius: 32,
                      padding: '11px 22px',
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: '0.01em',
                      textDecoration: 'none',
                      boxShadow: '0 4px 20px rgba(46,100,23,0.4)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}>
                    {banner?.cta_text || 'Shop Now'}
                    <FiArrowRight size={14} style={{ transition: 'transform 0.3s' }} className="group-hover:translate-x-1" />
                  </Link>
                  <Link href="/shop?onSale=true"
                    className="hero-cta-ghost inline-flex items-center gap-1.5"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontWeight: 600,
                      borderRadius: 32,
                      padding: '11px 22px',
                      fontSize: 13,
                      border: '1px solid rgba(255,255,255,0.2)',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}>
                    View Deals <FiChevronRight size={14} />
                  </Link>
                </div>

                {/* Trust badges — redesigned */}
                <div style={{
                  display: 'flex',
                  gap: 0,
                  alignItems: 'stretch',
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  width: 'fit-content',
                }}>
                  {[
                    { icon: <FiShield size={12} />, label: 'Buyer Protected' },
                    { icon: <FiTruck size={12} />, label: 'Assured' },
                    { icon: <FiCheck size={12} />, label: 'Verified Stores' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 13px',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      <span style={{ color: 'rgba(100,200,80,0.95)' }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — stacked side cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
            {SIDE_MOODS.map((mood) => <SideMoodCard key={mood.link} mood={mood} />)}
          </div>
        </div>

        {/* ── Mobile banner ── */}
        <div className="lg:hidden">
          <div className="relative rounded-2xl overflow-hidden h-[320px] sm:h-[380px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <CenterBannerBg banner={banner} />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="live-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 bg-white/15 text-white/90 border border-white/20 backdrop-blur-sm w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulseDot 2s ease infinite' }} />
                New on Zova
              </div>
              <h1 style={{
                fontSize: '1.6rem', fontWeight: 900, color: '#fff',
                lineHeight: 1.05, letterSpacing: '-0.025em',
                marginBottom: 8,
              }}>{banner?.title || 'Discover Your Style'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 20, lineHeight: 1.55 }}>
                {banner?.subtitle || 'Shop the latest fashion from trusted African stores'}
              </p>
              <div className="flex items-center gap-2.5">
                <Link href={banner?.cta_link || '/shop'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg, #EC9C00, #FFB830)',
                    color: '#fff', borderRadius: 28, padding: '10px 20px',
                    fontSize: 13, fontWeight: 800, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(236,156,0,0.4)',
                  }}>
                  {banner?.cta_text || 'Shop Now'} <FiArrowRight size={13} />
                </Link>
                <Link href="/shop?onSale=true"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,255,255,0.12)', color: '#fff',
                    fontWeight: 600, borderRadius: 28, padding: '10px 18px',
                    fontSize: 13, border: '1px solid rgba(255,255,255,0.2)',
                    textDecoration: 'none',
                  }}>
                  Deals <FiChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile mood strip */}
          <div className="chips-row flex gap-2.5 mt-2.5 overflow-x-auto pb-1" style={{ scrollSnapType: 'x mandatory' }}>
            {[HERO_MOOD, ...SIDE_MOODS, ...CHIP_MOODS].map((mood) => (
              <Link key={mood.link} href={mood.link} style={{
                position: 'relative', minWidth: 102, width: 102, height: 128,
                borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                scrollSnapAlign: 'start', textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
              }}>
                <Image src={mood.image} alt={mood.title} fill sizes="102px" loading="eager" style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: overlay }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', zIndex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{mood.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Desktop chip row ── */}
        <div
          className="chips-row hidden lg:flex gap-2.5 mt-2.5 overflow-x-auto pb-1 zova-shell"
          style={{
            maxHeight: expanded ? 200 : 0,
            overflow: expanded ? 'auto' : 'hidden',
            transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1)',
            scrollSnapType: 'x mandatory',
          }}
        >
          {CHIP_MOODS.map((mood) => <ChipMoodCard key={mood.link} mood={mood} />)}
        </div>

        {/* Expand toggle */}
        <div className="hidden lg:block mt-2 zova-shell">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="expand-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              width: '100%', padding: '10px 0',
              border: '1.5px dashed rgba(0,0,0,0.15)', borderRadius: 16,
              background: 'none', cursor: 'pointer',
              fontSize: 12, color: '#888', fontWeight: 600,
              transition: 'border-color 0.2s, color 0.2s',
              letterSpacing: '0.01em',
            }}>
            <span style={{ display: 'inline-block', transition: 'transform 0.35s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
            {expanded ? 'Show fewer moods' : `Explore all moods — ${CHIP_MOODS.length} more`}
          </button>
        </div>
      </div>

      {/* ── Marquee strip (no space after) ── */}
      <div style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 0', position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 64,
            background: 'linear-gradient(to right, rgba(255,255,255,0.95), transparent)',
            zIndex: 10, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 64,
            background: 'linear-gradient(to left, rgba(255,255,255,0.95), transparent)',
            zIndex: 10, pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 32s linear infinite' }}>
            {[0, 1].map((r) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {MARQUEE_ITEMS.map((item, i) => (
                  <span key={`${r}-${i}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontSize: 11, fontWeight: 700,
                    color: '#666',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    padding: '0 20px',
                  }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    {item.text}
                    <span style={{ color: 'rgba(0,0,0,0.15)', marginLeft: 20 }}>·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

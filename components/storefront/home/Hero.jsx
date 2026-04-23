"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiChevronRight, FiShield, FiTruck, FiCheck } from 'react-icons/fi';
import CategoriesModal from '@/components/catalog/browse/CategoriesModal';
import { getHeroBanner } from '@/features/storefront/home/api/client';

/* ─────────────────────────────────────────
   Static mood data (from ShopByMood)
───────────────────────────────────────── */
const HERO_MOOD = {
  title: 'Owambe Vibes',
  subtitle: 'Dress loud, step out right',
  label: 'Party',
  link: '/mood/owambe',
  image: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=700&auto=format&fit=crop&q=80',
};

const SIDE_MOODS = [
  {
    title: 'Casual & Chill',
    subtitle: 'Easy everyday looks',
    label: 'Everyday',
    link: '/mood/casual_chill',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Office Ready',
    subtitle: 'Clean workday looks',
    label: 'Work',
    link: '/mood/office_ready',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
];

const CHIP_MOODS = [
  { title: 'Date Night',       label: 'Night Out', link: '/mood/date_night',     image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=75' },
  { title: 'Sunday Best',      label: 'Sunday',    link: '/mood/sunday_best',    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=75' },
  { title: 'Street Style',     label: 'Trendy',    link: '/mood/street_trendy',  image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&auto=format&fit=crop&q=75' },
  { title: 'Soft Luxury',      label: 'Elevated',  link: '/mood/soft_luxury',    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&auto=format&fit=crop&q=75' },
  { title: 'Travel & Weekend', label: 'Outing',    link: '/mood/travel_weekend', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=75' },
];

const overlay = 'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.75) 100%)';

/* ── Pill ── */
const Pill = ({ label, small = false }) => (
  <span style={{
    display: 'inline-block',
    fontSize: small ? 9 : 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: small ? '2px 7px' : '3px 9px',
    borderRadius: 20,
    marginBottom: small ? 3 : 6,
    background: 'rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  }}>{label}</span>
);

/* ── Left tall card ── */
const HeroMoodCard = () => (
  <Link href={HERO_MOOD.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block', height: '100%',
    borderRadius: 18, overflow: 'hidden', textDecoration: 'none',
  }}>
    <img src={HERO_MOOD.image} alt={HERO_MOOD.title} className="mood-img"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px', zIndex: 1 }}>
      <Pill label={HERO_MOOD.label} />
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 5 }}>{HERO_MOOD.title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginBottom: 14 }}>{HERO_MOOD.subtitle}</div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'var(--zova-accent-emphasis)', color: '#fff', borderRadius: 24,
        padding: '8px 17px', fontSize: 12, fontWeight: 700,
      }}>Shop now ›</span>
    </div>
  </Link>
);

/* ── Right stacked card ── */
const SideMoodCard = ({ mood }) => (
  <Link href={mood.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block', flex: 1, minHeight: 0,
    borderRadius: 16, overflow: 'hidden', textDecoration: 'none',
  }}>
    <img src={mood.image} alt={mood.title} className="mood-img"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 13px', zIndex: 1 }}>
      <Pill label={mood.label} />
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>{mood.title}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.68)' }}>{mood.subtitle}</div>
    </div>
  </Link>
);

/* ── Bottom chip card ── */
const ChipMoodCard = ({ mood }) => (
  <Link href={mood.link} className="mood-img-zoom" style={{
    position: 'relative', display: 'block',
    minWidth: 110, width: 110, height: 138,
    borderRadius: 14, overflow: 'hidden',
    flexShrink: 0, scrollSnapAlign: 'start', textDecoration: 'none',
  }}>
    <img src={mood.image} alt={mood.title} className="mood-img"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }} />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', zIndex: 1 }}>
      <Pill label={mood.label} small />
      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{mood.title}</div>
    </div>
  </Link>
);

/* ══════════════════════════════════
   HERO
══════════════════════════════════ */
const Hero = () => {
  const [activeTab, setActiveTab]     = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banner, setBanner]           = useState(null);
  const [sellerCount, setSellerCount] = useState(0);
  const [expanded, setExpanded]       = useState(false);

  const navItems = [
    { name: 'Categories',   href: '#' },
    // ↓ Uses `sort=new_arrivals` so the route sorts by freshness_score DESC
    //   (via the product_scores table, not a simple created_at sort).
    { name: 'New Arrivals', href: '/shop?sort=new_arrivals' },
    // ↓ `onSale=true` now resolves BOTH discount_price products AND
    //   any product covered by an active promotion in the promotions table.
    { name: 'Deals',        href: '/shop?onSale=true' },
    { name: 'Top Stores',   href: '/stores' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await getHeroBanner();
        if (data.banner?.length > 0) {
          const b = data.banner[0];
          setBanner({ ...b, background_image: b.background_image || b.backgroundImage });
        }
        if (data.sellerStats) setSellerCount(data.sellerStats.count || 0);
      } catch {}
    })();
  }, []);

  const formatCount = (n) => {
    if (n >= 10000) return Math.floor(n / 1000) + 'K+';
    if (n >= 1000)  return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K+';
    if (n > 0)      return n.toLocaleString() + '+';
    return '';
  };

  const hasBgImage = !!banner?.background_image;

  return (
    <div className="w-full zova-page">
      <style jsx global>{`
        .mood-img-zoom:hover .mood-img { transform: scale(1.05); }
        .chips-row::-webkit-scrollbar  { display: none; }
        .chips-row { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes marquee  { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>

      {/* ── Nav ── */}
      <div className="relative z-40">
        <div className="zova-shell zova-topbar mt-3 rounded-full px-3 sm:px-5">
          <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto py-3 no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              const cls = `relative text-[13px] font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-300 pb-1.5 ${isActive ? 'text-[#2E6417]' : 'text-gray-500 hover:text-[#2E6417]'}`;
              if (item.name === 'Categories') return (
                <button key={item.name} onClick={() => { setActiveTab(item.name); setIsModalOpen(true); }} className={cls}>
                  {item.name}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-[var(--zova-accent-emphasis)] transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
                </button>
              );
              return (
                <Link key={item.name} href={item.href} onClick={() => { setActiveTab(item.name); setIsModalOpen(false); }} className={cls}>
                  {item.name}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-[var(--zova-accent-emphasis)] transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
                </Link>
              );
            })}
          </div>
        </div>
        {isModalOpen && <CategoriesModal onClose={() => setIsModalOpen(false)} />}
      </div>

      {/* ── Main content ── */}
      <div className="w-full pt-5 pb-3">

        {/* Header row */}
        <div className="zova-shell flex items-center justify-between mb-3">
          <div>
            <span className="zova-eyebrow">Curated discovery</span>
            <h2 className="zova-title mt-3 text-[1.35rem] font-black">Shop by mood</h2>
          </div>
          <Link href="/mood" className="text-[12px] font-semibold text-[#2E6417] hover:text-[#EC9C00] transition-colors flex items-center gap-1">
            See all moods <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── 3-column grid (desktop) ── */}
        <div
          className="hidden lg:grid gap-2"
          style={{ gridTemplateColumns: '1fr 1.9fr 1fr', height: 500 }}
        >
          {/* Left — Owambe hero mood card */}
          <HeroMoodCard />

          {/* Center — main banner */}
          <div className="relative rounded-2xl overflow-hidden">
            {hasBgImage ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.background_image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/22 to-black/5" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#245213] via-[#2E6417] to-[#2E6417]">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, #EC9C00 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-8 xl:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 bg-white/15 text-white/90 border border-white/20 backdrop-blur-sm w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC9C00]" style={{ animation: 'pulseDot 2s ease infinite' }} />
                New on Zova
              </div>
              <h1 className="zova-title text-white font-extrabold leading-[1.04] tracking-tight mb-3 drop-shadow text-[2rem] xl:text-[2.7rem] max-w-md">
                {banner?.title || 'Discover Your Style'}
              </h1>
              <p className="text-white/70 text-[13px] mb-6 max-w-xs leading-relaxed">
                {banner?.subtitle || 'Shop the latest fashion from trusted African stores'}
              </p>
              <div className="flex items-center gap-3 mb-6">
                <Link href={banner?.cta_link || '/shop'} className="zova-btn zova-btn-primary group text-[13px]">
                  {banner?.cta_text || 'Shop Now'}
                  <FiArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/shop?onSale=true" className="zova-btn flex items-center gap-1.5 px-7 py-3 bg-white/12 backdrop-blur-sm text-white font-semibold rounded-full text-[13px] border border-white/20 hover:bg-white/22 transition-all duration-300">
                  View Deals <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/55">
                <div className="flex items-center gap-1.5">
                  <FiShield className="w-3 h-3 text-[#EC9C00]" />
                  <span>{sellerCount > 0 ? `${formatCount(sellerCount)} Verified Stores` : 'Verified Stores'}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/25" />
                <div className="flex items-center gap-1.5"><FiTruck className="w-3 h-3" /><span>Secure Delivery</span></div>
                <span className="w-1 h-1 rounded-full bg-white/25" />
                <div className="flex items-center gap-1.5"><FiCheck className="w-3 h-3" /><span>Buyer Protection</span></div>
              </div>
            </div>
          </div>

          {/* Right — Casual & Chill + Office Ready stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
            {SIDE_MOODS.map((mood) => <SideMoodCard key={mood.link} mood={mood} />)}
          </div>
        </div>

        {/* ── Mobile: banner + small mood strip ── */}
        <div className="lg:hidden">
          <div className="relative rounded-2xl overflow-hidden h-[320px] sm:h-[380px]">
            {hasBgImage ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.background_image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#245213] via-[#2E6417] to-[#2E6417]" />
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 bg-white/15 text-white/90 border border-white/20 backdrop-blur-sm w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC9C00]" style={{ animation: 'pulseDot 2s ease infinite' }} />
                New on Zova
              </div>
              <h1 className="zova-title text-white text-2xl font-extrabold leading-tight mb-2">{banner?.title || 'Discover Your Style'}</h1>
              <p className="text-white/65 text-xs mb-5 max-w-xs">{banner?.subtitle || 'Shop the latest fashion from trusted African stores'}</p>
              <div className="flex items-center gap-2.5">
                <Link href={banner?.cta_link || '/shop'} className="zova-btn zova-btn-primary flex items-center gap-1.5 px-6 py-2.5 text-sm">
                  {banner?.cta_text || 'Shop Now'} <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/shop?onSale=true" className="zova-btn flex items-center gap-1 px-6 py-2.5 bg-white/12 text-white font-semibold rounded-full text-sm border border-white/20">
                  Deals <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile mood strip */}
          <div className="chips-row flex gap-2.5 mt-2.5 overflow-x-auto pb-1" style={{ scrollSnapType: 'x mandatory' }}>
            {[HERO_MOOD, ...SIDE_MOODS, ...CHIP_MOODS].map((mood) => (
              <Link key={mood.link} href={mood.link} style={{
                position: 'relative', minWidth: 100, width: 100, height: 125,
                borderRadius: 13, overflow: 'hidden', flexShrink: 0,
                scrollSnapAlign: 'start', textDecoration: 'none',
              }}>
                <img src={mood.image} alt={mood.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: overlay }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '7px 9px', zIndex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{mood.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom chip row ── */}
        <div
          className="chips-row hidden lg:flex gap-2.5 mt-2 overflow-x-auto pb-1 px-4 zova-shell"
          style={{
            maxHeight: expanded ? 180 : 0,
            overflow: expanded ? 'auto' : 'hidden',
            transition: 'max-height 0.4s ease',
            scrollSnapType: 'x mandatory',
          }}
        >
          {CHIP_MOODS.map((mood) => <ChipMoodCard key={mood.link} mood={mood} />)}
        </div>

        {/* Expand toggle */}
        <div className="hidden lg:block mt-2 px-4 zova-shell">
          <button
            onClick={() => setExpanded((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: 10,
              border: '1.5px dashed #d0d0d0', borderRadius: 16,
              background: 'none', cursor: 'pointer',
              fontSize: 13, color: '#666', fontWeight: 500,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--zova-primary-action)'; e.currentTarget.style.color = 'var(--zova-primary-action)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d0d0'; e.currentTarget.style.color = '#666'; }}
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.3s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 11 }}>▼</span>
            {expanded ? 'Show less' : `Show all moods (${CHIP_MOODS.length} more)`}
          </button>
        </div>
      </div>

      {/* ── Marquee ── */}
      <div className="border-t border-b border-[#2E6417]/10 bg-white/60 backdrop-blur-sm overflow-hidden mt-2">
        <div className="py-2.5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none" />
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 35s linear infinite' }}>
            {[0, 1].map((r) => (
              <div key={r} className="flex items-center shrink-0">
                {[
                  { icon: '🛡️', text: 'Buyer Protection on Every Order' },
                  { icon: '🚚', text: 'Fast & Reliable Delivery' },
                  { icon: '✓',  text: 'Verified African Stores' },
                  { icon: '💳', text: 'Secure Payment Methods' },
                  { icon: '🔄', text: 'Easy Returns & Refunds' },
                  { icon: '📦', text: 'Track Your Orders Live' },
                ].map((item, i) => (
                  <span key={`${r}-${i}`} className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 tracking-wider uppercase mx-6">
                    <span className="text-sm">{item.icon}</span>{item.text}
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

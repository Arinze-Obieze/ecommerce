"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const HERO_MOOD = {
  id: 3,
  title: 'Owambe Vibes',
  subtitle: 'Dress loud, step out right',
  label: 'Party',
  link: '/mood/owambe',
  image: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=700&auto=format&fit=crop&q=80',
};

const SIDE_MOODS = [
  {
    id: 1,
    title: 'Casual & Chill',
    subtitle: 'Easy everyday looks',
    label: 'Everyday',
    link: '/mood/casual_chill',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Office Ready',
    subtitle: 'Clean workday looks',
    label: 'Work',
    link: '/mood/office_ready',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
];

const COLLAPSED_MOODS = [
  {
    id: 4,
    title: 'Date Night',
    label: 'Night out',
    link: '/mood/date_night',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=75',
  },
  {
    id: 5,
    title: 'Sunday Best',
    label: 'Sunday',
    link: '/mood/sunday_best',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=75',
  },
  {
    id: 6,
    title: 'Street Style',
    label: 'Trendy',
    link: '/mood/street_trendy',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&auto=format&fit=crop&q=75',
  },
  {
    id: 7,
    title: 'Soft Luxury',
    label: 'Elevated',
    link: '/mood/soft_luxury',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&auto=format&fit=crop&q=75',
  },
  {
    id: 8,
    title: 'Travel & Weekend',
    label: 'Outing',
    link: '/mood/travel_weekend',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=75',
  },
];

const overlay = 'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.72) 100%)';

const Pill = ({ label, small = false }) => (
  <span style={{
    display: 'inline-block',
    fontSize: small ? 9 : 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: small ? '2px 7px' : '3px 9px',
    borderRadius: 20,
    marginBottom: small ? 4 : 7,
    background: 'rgba(255,255,255,0.18)',
    color: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  }}>
    {label}
  </span>
);

const HeroCard = ({ mood }) => (
  <Link
    href={mood.link}
    style={{ position: 'relative', display: 'block', height: 340, borderRadius: 18, overflow: 'hidden', textDecoration: 'none' }}
    className="mood-hero-card"
  >
    <img
      src={mood.image}
      alt={mood.title}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
      className="mood-img"
    />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, zIndex: 1 }}>
      <Pill label={mood.label} />
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>
        {mood.title}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>
        {mood.subtitle}
      </div>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--zova-primary-action)',
        color: '#fff',
        borderRadius: 24,
        padding: '8px 18px',
        fontSize: 13,
        fontWeight: 600,
      }}>
        Shop now ›
      </span>
    </div>
  </Link>
);

const SideCard = ({ mood }) => (
  <Link
    href={mood.link}
    style={{ position: 'relative', display: 'block', flex: 1, minHeight: 161, borderRadius: 18, overflow: 'hidden', textDecoration: 'none' }}
    className="mood-side-card"
  >
    <img
      src={mood.image}
      alt={mood.title}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
      className="mood-img"
    />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', zIndex: 1 }}>
      <Pill label={mood.label} />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>
        {mood.title}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{mood.subtitle}</div>
    </div>
  </Link>
);

const ChipCard = ({ mood }) => (
  <Link
    href={mood.link}
    style={{
      position: 'relative',
      display: 'block',
      minWidth: 110,
      width: 110,
      height: 140,
      borderRadius: 14,
      overflow: 'hidden',
      flexShrink: 0,
      scrollSnapAlign: 'start',
      textDecoration: 'none',
    }}
    className="mood-chip-card"
  >
    <img
      src={mood.image}
      alt={mood.title}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
      className="mood-img"
    />
    <div style={{ position: 'absolute', inset: 0, background: overlay }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', zIndex: 1 }}>
      <Pill label={mood.label} small />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{mood.title}</div>
    </div>
  </Link>
);

const ShopByMood = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section style={{ padding: '2rem 0', background: '#fff' }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <style>{`
        .mood-hero-card:hover .mood-img,
        .mood-side-card:hover .mood-img,
        .mood-chip-card:hover .mood-img { transform: scale(1.04); }
        .mood-expand-btn:hover { border-color: var(--color-primary) !important; color: var(--color-primary) !important; }
        .mood-chips-row::-webkit-scrollbar { display: none; }

        @media (max-width: 640px) {
          .mood-section-header,
          .mood-feature-grid,
          .mood-expand-wrap {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .mood-section-header {
            margin-bottom: 1.35rem !important;
          }

          .mood-feature-grid {
            gap: 12px !important;
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
            margin-bottom: 14px !important;
          }

          .mood-hero-card {
            height: 312px !important;
            border-radius: 14px !important;
          }

          .mood-side-card {
            min-height: 150px !important;
            border-radius: 14px !important;
          }

          .mood-chips-row {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }

        @media (max-width: 360px) {
          .mood-feature-grid {
            gap: 10px !important;
          }

          .mood-hero-card {
            height: 292px !important;
          }

          .mood-side-card {
            min-height: 141px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mood-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0 1rem' }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: '#111' }}>Shop by mood</span>
        <Link href="/mood" style={{ fontSize: 13, fontWeight: 500, color: 'var(--zova-primary-action)', textDecoration: 'none' }}>
          See all moods →
        </Link>
      </div>

      {/* Hero + Side grid */}
      <div className="mood-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 1rem', marginBottom: 10 }}>
        <HeroCard mood={HERO_MOOD} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SIDE_MOODS.map(mood => (
            <SideCard key={mood.id} mood={mood} />
          ))}
        </div>
      </div>

      {/* Expandable chip row */}
      <div
        className="mood-chips-row"
        style={{
          maxHeight: expanded ? 180 : 0,
          overflow: expanded ? 'auto' : 'hidden',
          transition: 'max-height 0.4s ease',
          display: 'flex',
          gap: 10,
          padding: expanded ? '0 1rem 6px' : '0 1rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {COLLAPSED_MOODS.map(mood => (
          <ChipCard key={mood.id} mood={mood} />
        ))}
      </div>

      {/* Expand toggle */}
      <div className="mood-expand-wrap" style={{ padding: '0 1rem', marginTop: 10 }}>
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="mood-expand-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: 10,
            border: '1.5px dashed #d0d0d0',
            borderRadius: 12,
            background: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#666',
            fontWeight: 500,
            transition: 'border-color 0.2s, color 0.2s',
          }}
        >
          <span style={{
            display: 'inline-block',
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: 11,
          }}>
            ▼
          </span>
          {expanded ? 'Show less' : `Show all moods (${COLLAPSED_MOODS.length} more)`}
        </button>
      </div>
      </div>
    </section>
  );
};

export default ShopByMood;

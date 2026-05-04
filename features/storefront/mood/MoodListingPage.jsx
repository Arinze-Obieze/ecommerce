'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { MOOD_META } from '@/features/storefront/mood/mood.constants';

const ALL_MOODS = [
  {
    slug: 'owambe',
    title: 'Owambe Vibes',
    subtitle: 'Dress loud, step out right',
    label: 'Party',
    image: '/images/mood/ankara_owambe.jpeg',
    featured: true,
  },
  {
    slug: 'casual_chill',
    title: 'Casual & Chill',
    subtitle: 'Easy everyday looks',
    label: 'Everyday',
    image: '/images/mood/casual_mood.jpeg',
    featured: true,
  },
  {
    slug: 'office_ready',
    title: 'Office Ready',
    subtitle: 'Clean workday looks',
    label: 'Work',
    image: '/images/mood/office_wear.jpeg',
  },
  {
    slug: 'date_night',
    title: 'Date Night',
    subtitle: 'Turn heads after dark',
    label: 'Night Out',
    image: '/images/mood/date_nghts.jpeg',
  },
  {
    slug: 'sunday_best',
    title: 'Sunday Best',
    subtitle: 'Look blessed, feel blessed',
    label: 'Sunday',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=75',
  },
  {
    slug: 'street_trendy',
    title: 'Street Style',
    subtitle: 'Own the pavement',
    label: 'Trendy',
    image: '/images/mood/street_wear.jpeg',
  },
  {
    slug: 'soft_luxury',
    title: 'Soft Luxury',
    subtitle: 'Quiet elegance, loud presence',
    label: 'Elevated',
    image: '/images/mood/soft_luxary.jpeg',
  },
  {
    slug: 'travel_weekend',
    title: 'Travel & Weekend',
    subtitle: 'Pack light, look right',
    label: 'Outing',
    image: '/images/mood/travel_weekend_mood.jpeg',
  },
];

const overlayStrong = 'linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.82) 100%)';
const overlayMid = 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.78) 100%)';

function MoodCard({ mood, large = false }) {
  const emoji = MOOD_META[mood.slug]?.emoji || '✨';
  return (
    <Link
      href={`/mood/${mood.slug}`}
      style={{
        position: 'relative',
        display: 'block',
        borderRadius: large ? 22 : 18,
        overflow: 'hidden',
        textDecoration: 'none',
        height: large ? 480 : 320,
        boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
      className="mood-card-link"
    >
      <Image
        src={mood.image}
        alt={mood.title}
        fill
        sizes={large ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
        style={{ objectFit: 'cover', transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        className="mood-card-img"
        priority={mood.featured}
      />
      <div style={{ position: 'absolute', inset: 0, background: large ? overlayStrong : overlayMid }} />

      {/* Top label */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(46,100,23,0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: '4px 10px',
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: '#fff',
      }}>
        <span>{emoji}</span> {mood.label}
      </div>

      {/* Arrow */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FiArrowRight size={12} color="#fff" />
      </div>

      {/* Bottom content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: large ? '22px 22px' : '16px 18px',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: large ? 26 : 18,
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: 5,
          letterSpacing: '-0.02em',
        }}>
          {mood.title}
        </div>
        <div style={{
          fontSize: large ? 13 : 11,
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.4,
          marginBottom: large ? 18 : 0,
        }}>
          {mood.subtitle}
        </div>
        {large && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #2E6417, #3a7a1e)',
            color: '#fff', borderRadius: 28,
            padding: '9px 18px', fontSize: 12, fontWeight: 800,
            letterSpacing: '0.02em',
            boxShadow: '0 4px 14px rgba(46,100,23,0.4)',
          }}>
            Shop this mood <FiArrowRight size={12} />
          </span>
        )}
      </div>
    </Link>
  );
}

export default function MoodListingPage() {
  const featured = ALL_MOODS.filter((m) => m.featured);
  const rest = ALL_MOODS.filter((m) => !m.featured);

  return (
    <div style={{ background: 'linear-gradient(180deg, #fbf8f1 0%, #f5f1ea 100%)', minHeight: '100vh' }}>
      <style>{`
        .mood-card-link:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.28) !important; transform: translateY(-2px); }
        .mood-card-link:hover .mood-card-img { transform: scale(1.06); }
      `}</style>

      <div className="zova-shell" style={{ paddingTop: 40, paddingBottom: 64 }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, color: '#888' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ color: '#2E6417', fontWeight: 600 }}>Shop by Mood</span>
        </div>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#2E6417',
            background: 'rgba(46,100,23,0.08)',
            border: '1px solid rgba(46,100,23,0.15)',
            borderRadius: 20, padding: '4px 12px',
            marginBottom: 12,
          }}>
            Curated Discovery
          </span>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 900,
            color: '#191B19',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 10px',
          }}>
            Shop by Mood
          </h1>
          <p style={{ fontSize: 15, color: '#888', margin: 0, maxWidth: 480, lineHeight: 1.65 }}>
            Don't know what to wear? Pick a vibe and we'll do the rest — every look is curated for the moment.
          </p>
        </div>

        {/* ── Featured row — 2 large cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 16,
        }}
          className="mood-featured-grid"
        >
          {featured.map((mood) => (
            <MoodCard key={mood.slug} mood={mood} large />
          ))}
        </div>

        {/* ── Rest grid — 3 columns ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
          className="mood-rest-grid"
        >
          {rest.map((mood) => (
            <MoodCard key={mood.slug} mood={mood} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{
          marginTop: 48,
          padding: '32px 40px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1a3a0a 0%, #2E6417 60%, #3a7a1e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 8px 32px rgba(46,100,23,0.22)',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              Can't decide?
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Browse everything in one place
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              Explore the full catalogue across all styles and moods.
            </div>
          </div>
          <Link href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', color: '#2E6417',
            borderRadius: 32, padding: '13px 26px',
            fontSize: 14, fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transition: 'transform 0.2s',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}>
            Shop All <FiArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Responsive overrides ── */}
      <style>{`
        @media (max-width: 768px) {
          .mood-featured-grid { grid-template-columns: 1fr !important; }
          .mood-rest-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .mood-rest-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

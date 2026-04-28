'use client';

import { useState } from 'react';
import {
  FiCheckCircle,
  FiChevronDown,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiShare2,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiUser,
  FiX,
} from 'react-icons/fi';

export const STORE_TABS = [
  { id: 'all', label: 'All Products', sort: null },
  { id: 'top_rated', label: 'Top Rated', sort: 'top_rated' },
  { id: 'new_arrivals', label: 'New Arrivals', sort: 'new_arrivals' },
];

function Avatar({ store, size = 96 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 18, flexShrink: 0, overflow: 'hidden', border: '1.5px solid var(--zova-border)', background: 'var(--zova-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      {store.logo_url ? (
        <img src={store.logo_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: size * 0.38, fontWeight: 900, color: 'var(--zova-primary-action)', fontFamily: 'var(--zova-font-display)' }}>
          {store.name?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function Pill({ children, variant = 'neutral' }) {
  const palette = {
    neutral: { bg: 'var(--zova-surface-alt)', text: 'var(--zova-text-body)' },
    green: { bg: 'var(--zova-green-soft)', text: 'var(--zova-ink)' },
    star: { bg: '#FFFBEB', text: '#92400E' },
    trend: { bg: '#FFF7ED', text: '#EA580C' },
  }[variant];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.text, border: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function ShareButton({ store }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, url });
      } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: 40, height: 40, borderRadius: 10, cursor: 'pointer', border: '1.5px solid var(--zova-border)', background: isHovered ? 'var(--zova-surface-alt)' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.14s', flexShrink: 0 }}
    >
      {isCopied ? <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--zova-primary-action)' }}>✓</span> : <FiShare2 size={14} style={{ color: 'var(--zova-ink)' }} />}
    </button>
  );
}

function VerifiedBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--zova-primary-action)', padding: '3px 9px', borderRadius: 100, background: 'var(--zova-green-soft)', border: '1px solid #B8D4A0' }}>
      <FiCheckCircle size={10} /> Verified
    </span>
  );
}

function TrendingBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#EA580C', padding: '3px 9px', borderRadius: 100, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
      <FiTrendingUp size={10} /> Trending
    </span>
  );
}

export function StoreHeader({ store, productCount, loading, activeTab, onTabChange }) {
  const rating = Number(store.rating || 4.8);
  const followers = Number(store.followers || 0);
  const reviews = Number(store.reviews || 0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const description = store.description || '';
  const isLongDescription = description.length > 120;

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid var(--zova-border)' }}>
      <div style={{ height: 6, background: 'repeating-linear-gradient(90deg, var(--zova-primary-action) 0px, var(--zova-primary-action) 20px, var(--zova-ink) 20px, var(--zova-ink) 40px)' }} />
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
          <Avatar store={store} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--zova-ink)', margin: 0, letterSpacing: '-0.03em', fontFamily: 'var(--zova-font-display)' }}>
                {store.name}
              </h1>
              {store.kyc_status === 'verified' ? <VerifiedBadge /> : null}
              {store.is_trending ? <TrendingBadge /> : null}
            </div>
            {store.location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <FiMapPin size={11} style={{ color: 'var(--zova-text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--zova-text-muted)', fontWeight: 500 }}>{store.location}</span>
              </div>
            ) : null}
            {description ? (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--zova-text-body)', lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
                  {isLongDescription && !isDescriptionOpen ? `${description.slice(0, 120)}…` : description}
                </p>
                {isLongDescription ? (
                  <button type="button" onClick={() => setIsDescriptionOpen((current) => !current)} style={{ fontSize: 12, color: 'var(--zova-primary-action)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {isDescriptionOpen ? 'Show less' : 'Read more'}
                    <FiChevronDown size={12} style={{ transform: isDescriptionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                ) : null}
              </div>
            ) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              <Pill variant="star"><FiStar size={11} style={{ color: '#F59E0B' }} /> {rating.toFixed(1)} Rating</Pill>
              {reviews > 0 ? <Pill variant="neutral"><FiMessageCircle size={11} /> {reviews.toLocaleString()} Reviews</Pill> : null}
              <Pill variant="neutral"><FiUser size={11} /> {followers.toLocaleString()} Followers</Pill>
              <Pill variant="green"><FiPackage size={11} /> {loading ? '…' : productCount} Products</Pill>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <ShareButton store={store} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--zova-border)', marginLeft: -28, marginRight: -28, paddingLeft: 28 }}>
          {STORE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                style={{ padding: '12px 18px', fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--zova-primary-action)' : 'var(--zova-text-body)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: isActive ? '2px solid var(--zova-primary-action)' : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {tab.id === 'top_rated' ? <FiStar size={12} style={{ color: isActive ? '#F59E0B' : 'var(--zova-text-muted)' }} /> : null}
                {tab.id === 'new_arrivals' ? <FiTrendingUp size={12} style={{ color: isActive ? '#EA580C' : 'var(--zova-text-muted)' }} /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function ActiveFilters({ selectedCategory, categories, activeTab, onClearCategory }) {
  const category = categories.find((entry) => String(entry.id) === selectedCategory);
  const tab = STORE_TABS.find((entry) => entry.id === activeTab);

  if (!category && activeTab === 'all') return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--zova-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Showing:
      </span>
      {activeTab !== 'all' ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: activeTab === 'top_rated' ? '#FFFBEB' : '#FFF7ED', color: activeTab === 'top_rated' ? '#92400E' : '#EA580C', border: `1px solid ${activeTab === 'top_rated' ? '#FDE68A' : '#FED7AA'}` }}>
          {activeTab === 'top_rated' ? <FiStar size={11} /> : <FiTrendingUp size={11} />}
          {tab?.label}
        </span>
      ) : null}
      {category ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: 'var(--zova-green-soft)', color: 'var(--zova-primary-action)', border: '1px solid #B8D4A0' }}>
          <FiTag size={10} />
          {category.name}
          <button type="button" onClick={onClearCategory} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zova-primary-action)', display: 'flex', alignItems: 'center', padding: 0, marginLeft: 2 }}>
            <FiX size={11} />
          </button>
        </span>
      ) : null}
    </div>
  );
}

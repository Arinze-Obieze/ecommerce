"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiGrid, FiShoppingBag, FiHeart, FiMapPin, FiSettings, FiLogOut, FiChevronDown, FiHome, FiCompass, FiBell } from 'react-icons/fi';
import { useAuth } from '@/components/auth/AuthProvider';

// Brand tokens — sourced from app/globals.css


const menuItems = [
  { label: 'Overview',   icon: FiGrid,        id: 'overview'   },
  { label: 'Orders',     icon: FiShoppingBag,  id: 'orders'     },
  { label: 'Wishlist',   icon: FiHeart,        id: 'wishlist'   },
  { label: 'Notifications', icon: FiBell,      id: 'notifications' },
  { label: 'Addresses',  icon: FiMapPin,       id: 'addresses'  },
  { label: 'Settings',   icon: FiSettings,     id: 'settings'   },
];

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────
const NavItem = ({ item, isActive, onClick }) => {
  const [hov, setHov] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: isActive ? 700 : 500,
        textAlign: 'left',
        transition: 'background 0.18s, color 0.18s',
        background: isActive
          ? 'var(--zova-green-soft)'
          : hov
          ? 'var(--zova-surface-alt)'
          : 'transparent',
        color: isActive ? 'var(--zova-primary-action)' : hov ? 'var(--zova-ink)' : 'var(--zova-text-body)',
      }}
    >
      {/* Icon */}
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isActive ? 'var(--zova-primary-action)' : hov ? 'var(--zova-border)' : 'transparent',
          transition: 'background 0.18s',
        }}
      >
        <item.icon
          size={16}
          style={{ color: isActive ? '#FFFFFF' : hov ? 'var(--zova-ink)' : 'var(--zova-text-muted)' }}
        />
      </span>
      {item.label}

      {/* Active indicator dot */}
      {isActive && (
        <span
          style={{
            marginLeft: 'auto',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--zova-primary-action)',
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfileSidebar({ activeTab, setActiveTab }) {
  const { signOut } = useAuth();
  const [signOutHov, setSignOutHov] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem = menuItems.find((item) => item.id === activeTab) || menuItems[0];

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncMenuState = (event) => {
      setMenuOpen(event.matches);
    };

    setMenuOpen(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMenuState);
      return () => mediaQuery.removeEventListener('change', syncMenuState);
    }

    mediaQuery.addListener(syncMenuState);
    return () => mediaQuery.removeListener(syncMenuState);
  }, []);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,244,237,0.94))',
        border: `1px solid ${'var(--zova-border)'}`,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 14px 36px rgba(25,27,25,0.08)',
      }}
    >
      {/* Label */}
      <div style={{ padding: '22px 22px 16px', borderBottom: `1px solid ${'var(--zova-border)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--zova-primary-action)',
              margin: 0,
            }}>
              My Account
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--zova-ink)', letterSpacing: '-0.03em' }}>
              {activeItem.label}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Collapse account menu' : 'Expand account menu'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${menuOpen ? '#B8D4A0' : 'var(--zova-border)'}`,
              background: menuOpen ? 'var(--zova-green-soft)' : '#FFFFFF',
              color: menuOpen ? 'var(--zova-primary-action-hover)' : 'var(--zova-ink)',
              borderRadius: 999,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Menu
            <FiChevronDown
              size={15}
              style={{
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.18s',
              }}
            />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 999,
              border: `1px solid ${'var(--zova-border)'}`,
              textDecoration: 'none',
              color: 'var(--zova-text-body)',
              fontSize: 12,
              fontWeight: 700,
              background: '#FFFFFF',
            }}
          >
            <FiHome size={13} />
            Home
          </Link>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 999,
              border: `1px solid ${'#B8D4A0'}`,
              textDecoration: 'none',
              color: 'var(--zova-primary-action-hover)',
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--zova-green-soft)',
            }}
          >
            <FiCompass size={13} />
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Nav */}
      {menuOpen ? (
        <nav style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setMenuOpen(false);
                }
              }}
            />
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--zova-border)', margin: '8px 4px' }} />

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => signOut()}
            onMouseEnter={() => setSignOutHov(true)}
            onMouseLeave={() => setSignOutHov(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'left',
              background: signOutHov ? '#FEF2F2' : 'transparent',
              color: signOutHov ? '#DC2626' : 'var(--zova-text-body)',
              transition: 'background 0.18s, color 0.18s',
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: signOutHov ? '#FEE2E2' : 'transparent',
                transition: 'background 0.18s',
              }}
            >
              <FiLogOut size={16} style={{ color: signOutHov ? '#DC2626' : 'var(--zova-text-muted)' }} />
            </span>
            Sign Out
          </button>
        </nav>
      ) : null}
    </div>
  );
}

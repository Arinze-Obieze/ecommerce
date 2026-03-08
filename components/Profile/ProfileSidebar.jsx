"use client";
import { useState } from 'react';
import { FiGrid, FiShoppingBag, FiHeart, FiMapPin, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  green:      '#00B86B',
  greenDark:  '#0F7A4F',
  greenTint:  '#EDFAF3',
  greenBorder:'#A8DFC4',
  white:      '#FFFFFF',
  charcoal:   '#111111',
  medGray:    '#666666',
  mutedText:  '#999999',
  border:     '#E8E8E8',
  softGray:   '#F5F5F5',
};

const menuItems = [
  { label: 'Overview',   icon: FiGrid,        id: 'overview'   },
  { label: 'Orders',     icon: FiShoppingBag,  id: 'orders'     },
  { label: 'Wishlist',   icon: FiHeart,        id: 'wishlist'   },
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
          ? THEME.greenTint
          : hov
          ? THEME.softGray
          : 'transparent',
        color: isActive ? THEME.green : hov ? THEME.charcoal : THEME.medGray,
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
          background: isActive ? THEME.green : hov ? THEME.border : 'transparent',
          transition: 'background 0.18s',
        }}
      >
        <item.icon
          size={16}
          style={{ color: isActive ? THEME.white : hov ? THEME.charcoal : THEME.mutedText }}
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
            background: THEME.green,
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

  return (
    <div
      style={{
        background: THEME.white,
        border: `1px solid ${THEME.border}`,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Label */}
      <div style={{ padding: '18px 20px 10px' }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: THEME.mutedText,
          margin: 0,
        }}>
          My Account
        </p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: THEME.border, margin: '8px 4px' }} />

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
            color: signOutHov ? '#DC2626' : THEME.medGray,
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
            <FiLogOut size={16} style={{ color: signOutHov ? '#DC2626' : THEME.mutedText }} />
          </span>
          Sign Out
        </button>
      </nav>
    </div>
  );
}
import Link from 'next/link';
import React from 'react';
import { FiArrowRight, FiPackage } from 'react-icons/fi';

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  green:      '#00B86B',
  greenDark:  '#0F7A4F',
  greenTint:  '#EDFAF3',
  greenBorder:'#A8DFC4',
  white:      '#FFFFFF',
  pageBg:     '#F9FAFB',
  charcoal:   '#111111',
  medGray:    '#666666',
  mutedText:  '#999999',
  border:     '#E8E8E8',
  softGray:   '#F5F5F5',
};

const STATUS_STYLES = {
  Delivered:  { color: '#00B86B', bg: '#EDFAF3', border: '#A8DFC4' },
  Shipped:    { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  Processing: { color: '#666666', bg: '#F5F5F5', border: '#E8E8E8' },
};

const OrderRow = ({ order }) => {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.Processing;
  const [hov, setHov] = React.useState(false);

  return (
    <Link
      href="/profile?tab=orders"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 12,
        border: `1.5px solid ${hov ? THEME.greenBorder : THEME.border}`,
        background: hov ? THEME.greenTint : THEME.white,
        textDecoration: 'none',
        transition: 'border-color 0.18s, background 0.18s',
        gap: 12,
      }}
    >
      {/* Left: icon + id + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: hov ? THEME.white : THEME.softGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.18s',
          }}
        >
          <FiPackage size={16} style={{ color: hov ? THEME.green : THEME.mutedText }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: THEME.charcoal, margin: 0, marginBottom: 2 }}>
            {order.id}
          </p>
          <p style={{ fontSize: 12, color: THEME.mutedText, margin: 0 }}>{order.date}</p>
        </div>
      </div>

      {/* Right: price + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: THEME.charcoal, margin: 0, marginBottom: 4, letterSpacing: '-0.02em' }}>
            ₦{order.total.toLocaleString()}
          </p>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 9px',
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: status.color,
              background: status.bg,
              border: `1px solid ${status.border}`,
            }}
          >
            {order.status}
          </span>
        </div>
        <FiArrowRight
          size={14}
          style={{
            color: hov ? THEME.green : THEME.mutedText,
            transform: hov ? 'translateX(2px)' : 'translateX(0)',
            transition: 'color 0.18s, transform 0.18s',
          }}
        />
      </div>
    </Link>
  );
};

const RecentOrder = () => {
  const [viewAllHov, setViewAllHov] = React.useState(false);

  const recentOrders = [
    { id: 'ORD-2024-001', date: 'Nov 20, 2024', total: 129.97, status: 'Delivered' },
    { id: 'ORD-2024-002', date: 'Nov 15, 2024', total: 79.98,  status: 'Shipped'   },
    { id: 'ORD-2024-003', date: 'Nov 10, 2024', total: 49.99,  status: 'Processing' },
  ];

  return (
    <section
      style={{
        background: THEME.white,
        border: `1px solid ${THEME.border}`,
        borderRadius: 20,
        padding: '22px 24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.02em' }}>
          Recent Orders
        </h2>
        <Link
          href="/profile?tab=orders"
          onMouseEnter={() => setViewAllHov(true)}
          onMouseLeave={() => setViewAllHov(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: viewAllHov ? THEME.greenDark : THEME.green,
            textDecoration: 'none',
            transition: 'color 0.18s',
          }}
        >
          View all <FiArrowRight size={12} style={{ transform: viewAllHov ? 'translateX(2px)' : 'none', transition: 'transform 0.18s' }} />
        </Link>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recentOrders.map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
};

export default RecentOrder;
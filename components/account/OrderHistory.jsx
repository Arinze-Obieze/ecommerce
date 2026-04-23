"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPackage, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Brand tokens — sourced from app/globals.css
const THEME = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  white:       '#FFFFFF',
  pageBg:      'var(--zova-linen)',
  charcoal:    'var(--zova-ink)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  border:      'var(--zova-border)',
  softGray:    'var(--zova-surface-alt)',
};

const STATUS = {
  completed:  { label: 'Completed',  color: 'var(--zova-primary-action)', bg: 'var(--zova-green-soft)', border: '#B8D4A0' },
  processing: { label: 'Processing', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  pending:    { label: 'Pending',    color: '#888888', bg: '#F5F5F5', border: '#E8E8E8' },
  cancelled:  { label: 'Cancelled',  color: 'var(--zova-error)', bg: '#FEF2F2', border: '#FECACA' },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ delay = 0 }) => (
  <div
    className="animate-pulse"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px',
      borderBottom: `1px solid ${THEME.border}`,
      animationDelay: `${delay}ms`,
      gap: 16,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: THEME.softGray, flexShrink: 0 }} />
      <div>
        <div style={{ width: 100, height: 11, background: THEME.softGray, borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: 140, height: 9, background: THEME.softGray, borderRadius: 4 }} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 70, height: 22, background: THEME.softGray, borderRadius: 100 }} />
      <div style={{ width: 80, height: 13, background: THEME.softGray, borderRadius: 4 }} />
    </div>
  </div>
);

// ─── ORDER ROW ────────────────────────────────────────────────────────────────
const OrderRow = ({ order }) => {
  const [hov, setHov] = useState(false);
  const st = STATUS[order.status] || STATUS.pending;
  const itemCount = order.order_items?.length || 0;

  return (
    <Link
      href={`/profile/orders/${order.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: `1px solid ${THEME.border}`,
        background: hov ? THEME.pageBg : THEME.white,
        transition: 'background 0.18s',
        gap: 16,
        flexWrap: 'wrap',
        textDecoration: 'none',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: hov ? THEME.greenTint : THEME.softGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.18s',
          }}
        >
          <FiPackage size={17} style={{ color: hov ? THEME.green : THEME.mutedText }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: THEME.charcoal, margin: 0, marginBottom: 3, letterSpacing: '0.02em' }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p style={{ fontSize: 12, color: THEME.mutedText, margin: 0 }}>
            {formatDate(order.created_at)} &middot; {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap', marginLeft: 'auto' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 11px',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'capitalize',
            color: st.color,
            background: st.bg,
            border: `1px solid ${st.border}`,
          }}
        >
          {st.label}
        </span>
        <p style={{ fontSize: 14, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.02em' }}>
          {formatPrice(order.total_amount)}
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 999,
            background: hov ? THEME.greenTint : THEME.softGray,
            color: hov ? THEME.greenDark : THEME.charcoal,
            fontSize: 12,
            fontWeight: 700,
            transition: 'background 0.18s, color 0.18s',
          }}
        >
          View details
          <FiArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [ctaHov, setCtaHov]   = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, order_items(id, product_id, quantity, price)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText, margin: 0, marginBottom: 4 }}>
            My Account
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em' }}>
            Order History
          </h2>
        </div>
        {!loading && orders.length > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              background: THEME.softGray,
              color: THEME.medGray,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <FiPackage size={11} />
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>

      {/* ── Table card ── */}
      <div
        style={{
          background: THEME.white,
          border: `1px solid ${THEME.border}`,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonRow key={i} delay={i * 60} />)
        ) : orders.length > 0 ? (
          orders.map((order) => <OrderRow key={order.id} order={order} />)
        ) : (
          /* ── Empty state ── */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: THEME.greenTint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <FiShoppingBag size={24} style={{ color: THEME.green }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.charcoal, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              No orders yet
            </h3>
            <p style={{ fontSize: 13, color: THEME.mutedText, margin: '0 0 24px', maxWidth: 280, lineHeight: 1.6 }}>
              When you place an order it will appear here.
            </p>
            <Link
              href="/shop"
              onMouseEnter={() => setCtaHov(true)}
              onMouseLeave={() => setCtaHov(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: THEME.white,
                background: ctaHov ? THEME.greenDark : THEME.green,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Start Shopping <FiArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

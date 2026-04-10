"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';
import { FiPackage, FiHeart, FiMapPin, FiClock, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  green:       '#00B86B',
  greenDark:   '#0F7A4F',
  greenDeep:   '#0A3D2E',
  greenTint:   '#EDFAF3',
  greenBorder: '#A8DFC4',
  white:       '#FFFFFF',
  pageBg:      '#F9FAFB',
  charcoal:    '#111111',
  medGray:     '#666666',
  mutedText:   '#999999',
  border:      '#E8E8E8',
  softGray:    '#F5F5F5',
};

const STATUS = {
  completed:  { label: 'Completed', color: '#00B86B', bg: '#EDFAF3', border: '#A8DFC4' },
  processing: { label: 'Processing', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  pending:    { label: 'Pending', color: '#666666', bg: '#F5F5F5', border: '#E8E8E8' },
  cancelled:  { label: 'Cancelled', color: '#E53935', bg: '#FEF2F2', border: '#FECACA' },
};

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, loading }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        background: THEME.white,
        border: `1px solid ${hov ? THEME.greenBorder : THEME.border}`,
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        cursor: 'default',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: THEME.greenTint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: THEME.green }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: THEME.mutedText, fontWeight: 600, margin: 0, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        {loading ? (
          <div style={{ width: 32, height: 22, background: THEME.softGray, borderRadius: 6, marginTop: 2 }} className="animate-pulse" />
        ) : (
          <h3 style={{ fontSize: 26, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </h3>
        )}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfileOverview() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const [stats, setStats] = useState({ totalOrders: 0, wishlistCount: wishlistItems.size, addressCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkHov, setLinkHov] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const [
          { count: ordersCount },
          { count: addressCount },
          { data: recentOrderRows, error: recentOrdersError },
        ] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('user_addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase
            .from('orders')
            .select('id, total_amount, status, created_at, order_items(id)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        if (recentOrdersError) throw recentOrdersError;
        setStats({ totalOrders: ordersCount || 0, wishlistCount: wishlistItems.size, addressCount: addressCount || 0 });
        setRecentOrders(recentOrderRows || []);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats({ totalOrders: 0, wishlistCount: wishlistItems.size, addressCount: 0 });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id, wishlistItems.size]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const statCards = [
    { label: 'Total Orders',     value: stats.totalOrders,   icon: FiPackage },
    { label: 'Wishlist',         value: stats.wishlistCount, icon: FiHeart   },
    { label: 'Saved Addresses',  value: stats.addressCount,  icon: FiMapPin  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome Banner ── */}
      <div
        className="p-5 sm:p-7"
        style={{
          background: THEME.white,
          border: `1px solid ${THEME.border}`,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 0 }} className="w-full sm:w-auto">
          {/* Avatar */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${THEME.green}, ${THEME.greenDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 800,
              color: THEME.white,
              flexShrink: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, color: THEME.mutedText, fontWeight: 600, margin: 0, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em', wordBreak: 'break-word' }}>
              {userName}
            </h1>
            <p style={{ fontSize: 13, color: THEME.medGray, margin: '3px 0 0', wordBreak: 'break-word' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick shop CTA */}
        <Link
          href="/shop"
          className="w-full justify-center sm:w-auto"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            background: linkHov ? THEME.greenDark : THEME.green,
            color: THEME.white,
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
          onMouseEnter={() => setLinkHov(true)}
          onMouseLeave={() => setLinkHov(false)}
        >
          <FiShoppingBag size={14} />
          Continue Shopping
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gap: 14 }} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div
        className="p-5 sm:p-7"
        style={{
          background: THEME.white,
          border: `1px solid ${THEME.border}`,
          borderRadius: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.02em' }}>
            Recent Activity
          </h2>
          <Link
            href="/profile?tab=orders"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: THEME.green,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View All <FiArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse" style={{ height: 76, borderRadius: 14, background: THEME.softGray }} />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentOrders.map((order) => {
              const status = STATUS[order.status] || STATUS.pending;
              const itemCount = order.order_items?.length || 0;
              return (
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `1px solid ${THEME.border}`,
                    textDecoration: 'none',
                    background: THEME.white,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: THEME.greenTint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FiClock size={16} style={{ color: THEME.green }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: THEME.charcoal }}>
                        Order #{String(order.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.medGray }}>
                        {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: status.color,
                        background: status.bg,
                        border: `1px solid ${status.border}`,
                        textTransform: 'capitalize',
                      }}
                    >
                      {status.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: THEME.charcoal }}>
                      {formatPrice(order.total_amount)}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: THEME.greenTint,
                        color: THEME.greenDark,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      View details
                      <FiArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 24px',
              textAlign: 'center',
              background: THEME.pageBg,
              borderRadius: 14,
              border: `1.5px dashed ${THEME.border}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: THEME.softGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <FiClock size={20} style={{ color: THEME.mutedText }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: THEME.charcoal, margin: 0, marginBottom: 4 }}>
              No recent activity yet
            </p>
            <p style={{ fontSize: 13, color: THEME.mutedText, margin: 0 }}>
              Your newest orders will appear here after checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

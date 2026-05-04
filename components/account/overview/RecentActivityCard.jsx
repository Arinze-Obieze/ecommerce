"use client";

import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import {
  ORDER_STATUS_STYLES,
  formatOrderDate,
  formatOrderPrice,
} from "@/components/account/order-history/orderHistory.utils";

function RecentActivitySkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[76px] animate-pulse rounded-[14px] bg-[var(--zova-surface-alt)]"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}

function RecentOrderRow({ order }) {
  const status = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.pending;
  const itemCount = order.order_items?.length || 0;

  return (
    <Link href={`/profile/orders/${order.id}`} className="zova-account-recent-row">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="zova-account-list-icon rounded-xl bg-[var(--zova-green-soft)] text-[var(--zova-primary-action)]">
          <FiClock size={16} />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-extrabold text-(--zova-text-strong)">
            Order #{String(order.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="m-0 mt-1 text-xs text-[var(--zova-text-body)]">
            {formatOrderDate(order.created_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 flex-wrap">
        <span
          className="zova-account-status-pill"
          style={{
            color: status.color,
            background: status.background,
            borderColor: status.border,
          }}
        >
          {status.label}
        </span>
        <span className="text-[13px] font-extrabold text-(--zova-text-strong)">
          {formatOrderPrice(order.total_amount)}
        </span>
        <span className="zova-account-list-cta">
          View details
          <FiArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

function EmptyRecentActivity() {
  return (
    <div className="zova-account-empty zova-account-empty-compact">
      <div className="zova-account-empty-icon zova-account-empty-icon-muted">
        <FiClock size={20} />
      </div>
      <p className="m-0 mb-1 text-sm font-bold text-(--zova-text-strong)">No recent activity yet</p>
      <p className="m-0 text-[13px] text-(--zova-text-muted)">
        Your newest orders will appear here after checkout.
      </p>
    </div>
  );
}

export default function RecentActivityCard({ loading, recentOrders }) {
  return (
    <section className="zova-account-card p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="m-0 text-base font-extrabold tracking-[-0.02em] text-(--zova-text-strong)">
          Recent Activity
        </h2>
        <Link
          href="/profile?tab=orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--zova-primary-action)] no-underline"
        >
          View All
          <FiArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <RecentActivitySkeleton />
      ) : recentOrders.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {recentOrders.map((order) => (
            <RecentOrderRow key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyRecentActivity />
      )}
    </section>
  );
}

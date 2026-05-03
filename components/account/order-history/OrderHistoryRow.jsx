"use client";

import Link from "next/link";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import {
  ORDER_STATUS_STYLES,
  formatOrderDate,
  formatOrderPrice,
} from "@/components/account/order-history/orderHistory.utils";

export default function OrderHistoryRow({ order }) {
  const status = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.pending;
  const itemCount = order.order_items?.length || 0;

  return (
    <Link href={`/profile/orders/${order.id}`} className="zova-account-list-row zova-account-list-link">
      <div className="flex items-center gap-4">
        <div className="zova-account-list-icon">
          <FiPackage size={17} />
        </div>
        <div>
          <p className="m-0 text-[13px] font-extrabold tracking-[0.02em] text-(--zova-text-strong)">
            #{String(order.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="m-0 mt-1 text-xs text-(--zova-text-muted)">
            {formatOrderDate(order.created_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="zova-account-list-meta">
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
        <p className="m-0 text-sm font-extrabold tracking-[-0.02em] text-(--zova-text-strong)">
          {formatOrderPrice(order.total_amount)}
        </p>
        <span className="zova-account-list-cta">
          View details
          <FiArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

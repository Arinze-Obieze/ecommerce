"use client";

import { FiPackage } from "react-icons/fi";

export default function OrderHistoryHeader({ count, loading }) {
  return (
    <div className="zova-account-heading">
      <div>
        <p className="zova-account-kicker">My Account</p>
        <h2 className="zova-account-title">Order History</h2>
      </div>

      {!loading && count > 0 ? (
        <span className="zova-account-pill zova-account-pill-muted">
          <FiPackage size={11} />
          {count} {count === 1 ? "order" : "orders"}
        </span>
      ) : null}
    </div>
  );
}

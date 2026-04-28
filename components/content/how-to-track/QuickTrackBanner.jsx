import Link from "next/link";

export default function QuickTrackBanner() {
  return (
    <div className="zova-info-quickbar">
      <div className="zova-info-quickbar-inner">
        <div className="zova-info-input-shell">
          <input
            type="text"
            placeholder="Enter your order number e.g. ZV-2024-08821"
            className="zova-info-input"
          />
          <button className="zova-info-btn is-primary" style={{ borderRadius: 0 }}>
            Track →
          </button>
        </div>
        <div style={{ color: "#9CA3AF", fontSize: 13 }}>or</div>
        <Link href="/login" className="zova-info-btn is-secondary" style={{ whiteSpace: "nowrap" }}>
          Log in to My Orders
        </Link>
      </div>
    </div>
  );
}

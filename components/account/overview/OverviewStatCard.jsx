"use client";

export default function OverviewStatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="zova-account-stat-card">
      <div className="zova-account-stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <p className="zova-account-stat-label">{label}</p>
        {loading ? (
          <div className="mt-0.5 h-[22px] w-8 animate-pulse rounded-md bg-[var(--zova-surface-alt)]" />
        ) : (
          <h3 className="zova-account-stat-value">{value}</h3>
        )}
      </div>
    </div>
  );
}

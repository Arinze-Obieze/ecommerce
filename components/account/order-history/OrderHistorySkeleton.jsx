"use client";

function SkeletonRow({ index }) {
  return (
    <div className="zova-account-list-row animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-[10px] bg-[var(--zova-surface-alt)]" />
        <div>
          <div className="mb-2 h-[11px] w-[100px] rounded bg-[var(--zova-surface-alt)]" />
          <div className="h-[9px] w-[140px] rounded bg-[var(--zova-surface-alt)]" />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="h-[22px] w-[70px] rounded-full bg-[var(--zova-surface-alt)]" />
        <div className="h-[13px] w-[80px] rounded bg-[var(--zova-surface-alt)]" />
      </div>
    </div>
  );
}

export default function OrderHistorySkeleton() {
  return Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} index={index} />);
}

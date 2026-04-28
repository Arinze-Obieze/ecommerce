/**
 * DashboardPageHeader
 * Top-of-page card used on every store dashboard page.
 *
 * Props:
 *   title    — (string) required
 *   subtitle — (string) optional
 *   children — optional right-side content (button, range picker, etc.)
 */
export default function DashboardPageHeader({ title, subtitle, children }) {
  return (
    <div className="zova-ops-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h2 className="zova-title mt-1 text-lg font-black text-gray-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#6B6B6B]">{subtitle}</p> : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </div>
  );
}

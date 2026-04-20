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
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </div>
  );
}

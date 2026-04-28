export default function OrderHeaderCard({ order, status, itemCount, formatDateTime }) {
  return (
    <section className="zova-account-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--zova-text-muted)' }}>
            Order Details
          </p>
          <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 900, color: 'var(--zova-text-strong)' }}>
            #{String(order.id).slice(0, 8).toUpperCase()}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--zova-text-body)' }}>
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="zova-account-pill" style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
            {status.label}
          </span>
          <span className="zova-account-pill" style={{ color: 'var(--zova-text-strong)', background: 'var(--zova-surface-alt)', border: '1px solid var(--zova-border)' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </section>
  );
}

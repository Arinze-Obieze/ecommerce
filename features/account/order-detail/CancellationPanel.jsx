export default function CancellationPanel({ cancellationRequest, canRequestCancellation, setCancelModalOpen }) {
  return (
    <section className="zova-account-card sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--zova-text-muted)' }}>
            Cancellation
          </p>
          {cancellationRequest ? (
            <>
              <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--zova-text-strong)' }}>Cancellation request submitted</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
                We have your request and the operations team will review it before dispatch progresses further.
              </p>
            </>
          ) : canRequestCancellation ? (
            <>
              <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--zova-text-strong)' }}>Need to stop this order?</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
                Start a cancellation request here and share the reason in a quick confirmation modal.
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--zova-text-strong)' }}>Cancellation unavailable</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
                This order is no longer in a stage where a new cancellation request can be submitted.
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {cancellationRequest ? (
            <div className="inline-flex items-center rounded-full border border-[#E8E8E8] bg-[#F5F5F5] px-4 py-2 text-sm font-semibold text-[#111111]">
              {String(cancellationRequest.status || 'pending').replace(/_/g, ' ')}
            </div>
          ) : canRequestCancellation ? (
            <button type="button" onClick={() => setCancelModalOpen(true)} className="zova-account-button is-primary" style={{ padding: '12px 18px', cursor: 'pointer' }}>
              Request cancellation
            </button>
          ) : (
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold" style={{ color: 'var(--zova-text-body)', background: 'var(--zova-surface-alt)', border: '1px solid var(--zova-border)' }}>
              Not available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

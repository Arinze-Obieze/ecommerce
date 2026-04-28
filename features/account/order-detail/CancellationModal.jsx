export default function CancellationModal({
  open,
  cancelBusy,
  cancelReason,
  setCancelReason,
  setCancelModalOpen,
  submitCancellationRequest,
}) {
  if (!open) return null;

  return (
    <div className="zova-account-overlay">
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          border: '1px solid var(--zova-border)',
          borderRadius: 24,
          background: 'white',
          padding: 24,
          boxShadow: '0 24px 80px rgba(17, 17, 17, 0.18)',
        }}
      >
        <div className="space-y-3">
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--zova-text-muted)' }}>
              Cancellation Request
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 900, color: 'var(--zova-text-strong)' }}>
              Why do you want to cancel this order?
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
            Share a short reason and the operations team will review it before dispatch progresses further.
          </p>
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Tell us why you need this order cancelled"
            className="zova-account-textarea"
            style={{ minHeight: 140 }}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                if (cancelBusy) return;
                setCancelModalOpen(false);
              }}
              className="zova-account-button is-ghost"
              style={{ padding: '12px 16px', cursor: cancelBusy ? 'not-allowed' : 'pointer', opacity: cancelBusy ? 0.6 : 1 }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={submitCancellationRequest}
              disabled={cancelBusy || !cancelReason.trim()}
              className="zova-account-button is-primary"
              style={{ padding: '12px 18px', cursor: cancelBusy || !cancelReason.trim() ? 'not-allowed' : 'pointer', opacity: cancelBusy || !cancelReason.trim() ? 0.6 : 1 }}
            >
              {cancelBusy ? 'Submitting...' : 'Submit cancellation request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

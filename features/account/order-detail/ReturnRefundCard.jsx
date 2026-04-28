import DetailCard from '@/features/account/order-detail/DetailCard';

export default function ReturnRefundCard({
  returnRequest,
  canRequestReturn,
  returnReason,
  setReturnReason,
  returnDetails,
  setReturnDetails,
  returnBusy,
  submitReturnRequest,
  formatDateTime,
  formatMoney,
}) {
  return (
    <DetailCard title="Return & Refund">
      {returnRequest ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center rounded-full border border-[#E8E8E8] bg-[#F5F5F5] px-3 py-1 font-semibold text-[#111111]">
              Return: {String(returnRequest.status || 'pending').replace(/_/g, ' ')}
            </div>
            <div className="inline-flex items-center rounded-full border border-[#B8D4A0] bg-primary-soft px-3 py-1 font-semibold text-primary-hover">
              Refund: {String(returnRequest.refund_status || 'not_requested').replace(/_/g, ' ')}
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>Reason: {returnRequest.reason}</p>
          {returnRequest.details ? <p style={{ margin: 0, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>Details: {returnRequest.details}</p> : null}
          {returnRequest.seller_note ? <p style={{ margin: 0, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>Seller note: {returnRequest.seller_note}</p> : null}
          {returnRequest.refund_amount ? <p style={{ margin: 0, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>Refund amount: {formatMoney(returnRequest.refund_amount)}</p> : null}
          {returnRequest.refund_reference ? <p style={{ margin: 0, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>Refund reference: {returnRequest.refund_reference}</p> : null}
          <p style={{ margin: 0, fontSize: 12, color: 'var(--zova-text-muted)' }}>Submitted {formatDateTime(returnRequest.created_at)}</p>
        </div>
      ) : canRequestReturn ? (
        <div className="space-y-3">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
            If the delivered item needs to come back, submit a return request here and we will keep the refund status visible as it moves through review and payout handling.
          </p>
          <input value={returnReason} onChange={(event) => setReturnReason(event.target.value)} placeholder="Reason for the return" className="zova-account-field" />
          <textarea
            value={returnDetails}
            onChange={(event) => setReturnDetails(event.target.value)}
            placeholder="Share any item issue, sizing problem, or quality concern"
            className="zova-account-textarea"
            style={{ minHeight: 110 }}
          />
          <button
            type="button"
            onClick={submitReturnRequest}
            disabled={returnBusy || !returnReason.trim()}
            className="zova-account-button is-primary"
            style={{ padding: '11px 16px', fontSize: 13, cursor: returnBusy || !returnReason.trim() ? 'not-allowed' : 'pointer', opacity: returnBusy || !returnReason.trim() ? 0.6 : 1 }}
          >
            {returnBusy ? 'Submitting...' : 'Request return'}
          </button>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--zova-text-body)', lineHeight: 1.7 }}>
          Returns become available after delivery, and active requests will remain visible here until closure.
        </p>
      )}
    </DetailCard>
  );
}

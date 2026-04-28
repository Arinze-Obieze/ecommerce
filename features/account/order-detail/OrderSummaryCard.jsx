import DetailCard from '@/features/account/order-detail/DetailCard';

export default function OrderSummaryCard({ order, orderTotal, formatDateTime, formatMoney }) {
  return (
    <DetailCard title="Order summary">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--zova-text-body)' }}>Items total</span>
          <strong style={{ color: 'var(--zova-text-strong)' }}>{formatMoney(orderTotal || order.total_amount)}</strong>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--zova-text-body)' }}>Payment reference</span>
          <strong style={{ color: 'var(--zova-text-strong)', wordBreak: 'break-word', textAlign: 'right' }}>{order.payment_reference || 'Pending'}</strong>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--zova-text-body)' }}>Last updated</span>
          <strong style={{ color: 'var(--zova-text-strong)', textAlign: 'right' }}>{formatDateTime(order.updated_at)}</strong>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--zova-text-body)' }}>Fulfillment</span>
          <strong style={{ color: 'var(--zova-text-strong)', textTransform: 'capitalize', textAlign: 'right' }}>{order.fulfillment_status || 'Processing'}</strong>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--zova-text-body)' }}>Escrow</span>
          <strong style={{ color: 'var(--zova-text-strong)', textTransform: 'capitalize', textAlign: 'right' }}>{order.escrow_status || 'Not funded'}</strong>
        </div>
        <div style={{ height: 1, background: 'var(--zova-border)', margin: '6px 0' }} />
        <div className="flex items-center justify-between gap-4">
          <span style={{ color: 'var(--zova-text-strong)', fontSize: 14, fontWeight: 700 }}>Order total</span>
          <strong style={{ color: 'var(--zova-text-strong)', fontSize: 18 }}>{formatMoney(order.total_amount)}</strong>
        </div>
      </div>
    </DetailCard>
  );
}

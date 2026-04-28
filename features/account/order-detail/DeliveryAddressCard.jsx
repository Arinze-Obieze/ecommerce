import { FiMapPin } from 'react-icons/fi';
import DetailCard from '@/features/account/order-detail/DetailCard';

export default function DeliveryAddressCard({ shippingAddress }) {
  return (
    <DetailCard title="Delivery address">
      {shippingAddress ? (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8D4A0] bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-hover">
            <FiMapPin size={12} />
            {shippingAddress.label || 'Delivery address'}
          </div>
          <div className="text-sm text-gray-700 leading-6">
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--zova-text-strong)' }}>{shippingAddress.address_line1}</p>
            {shippingAddress.address_line2 ? <p style={{ margin: '2px 0 0' }}>{shippingAddress.address_line2}</p> : null}
            <p style={{ margin: '2px 0 0' }}>{[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code].filter(Boolean).join(', ')}</p>
            <p style={{ margin: '2px 0 0' }}>{shippingAddress.country}</p>
            <p style={{ margin: '8px 0 0', fontWeight: 700, color: 'var(--zova-text-strong)' }}>{shippingAddress.phone}</p>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--zova-text-muted)' }}>
          Delivery address snapshot not available for this order.
        </p>
      )}
    </DetailCard>
  );
}

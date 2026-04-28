import Link from 'next/link';
import DetailCard from '@/features/account/order-detail/DetailCard';
import { buildVariantLabel } from '@/features/account/order-detail/orderDetail.utils';

export default function OrderItemsCard({ items, formatMoney }) {
  return (
    <DetailCard title="Items in this order">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--zova-border)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', background: 'var(--zova-surface-alt)', border: '1px solid var(--zova-border)', flexShrink: 0 }}>
              <img
                src={item.product?.image_urls?.[0] || 'https://placehold.co/144x144?text=Item'}
                alt={item.product?.name || 'Ordered item'}
                className="h-full w-full object-cover"
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--zova-text-strong)' }}>
                {item.product?.name || 'Product item'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--zova-text-body)' }}>Quantity: {item.quantity}</p>
              {buildVariantLabel(item.variant) ? (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--zova-text-body)' }}>
                  Variant: {buildVariantLabel(item.variant)}
                </p>
              ) : null}
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--zova-text-body)' }}>Unit price: {formatMoney(item.price)}</p>
              {item.product?.slug ? (
                <Link href={`/products/${item.product.slug}`} style={{ display: 'inline-flex', marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--zova-primary-action)', textDecoration: 'none' }}>
                  View product
                </Link>
              ) : null}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--zova-text-strong)' }}>
              {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

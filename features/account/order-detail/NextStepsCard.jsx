import Link from 'next/link';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';
import DetailCard from '@/features/account/order-detail/DetailCard';

export default function NextStepsCard() {
  return (
    <DetailCard title="What you can do next">
      <div className="space-y-3">
        <Link
          href="/profile?tab=orders"
          style={{
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'var(--zova-primary-action)',
            color: 'white',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <FiPackage size={15} />
          Back to all orders
        </Link>
        <Link
          href="/shop"
          style={{
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'var(--zova-green-soft)',
            color: 'var(--zova-primary-action-hover)',
            border: '1px solid #B8D4A0',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <FiShoppingBag size={15} />
          Continue shopping
        </Link>
      </div>
    </DetailCard>
  );
}

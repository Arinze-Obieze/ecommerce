import Link from 'next/link';
import { FiArrowLeft, FiHome, FiShoppingBag } from 'react-icons/fi';

export default function OrderActionsBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Link href="/profile?tab=orders" className="zova-account-button is-ghost" style={{ padding: '10px 14px', fontSize: 13 }}>
        <FiArrowLeft size={14} />
        Back to orders
      </Link>
      <Link href="/shop" className="zova-account-button is-secondary" style={{ padding: '10px 14px', fontSize: 13 }}>
        <FiShoppingBag size={14} />
        Shop more
      </Link>
      <Link href="/" className="zova-account-button is-ghost" style={{ padding: '10px 14px', color: 'var(--zova-text-body)', fontSize: 13 }}>
        <FiHome size={14} />
        Home
      </Link>
    </div>
  );
}

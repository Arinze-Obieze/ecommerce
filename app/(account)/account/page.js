'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth/client';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';
import { FiPackage, FiMapPin, FiHeart, FiUser, FiLogOut } from 'react-icons/fi';

const NAV_SECTIONS = [
  { href: '/orders', icon: FiPackage, label: 'Orders', description: 'Track and manage your orders' },
  { href: '/profile', icon: FiUser, label: 'Profile', description: 'Edit your name and details' },
  { href: '/wishlist', icon: FiHeart, label: 'Wishlist', description: 'Your saved items' },
  { href: '/addresses', icon: FiMapPin, label: 'Addresses', description: 'Manage delivery addresses' },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-(--zova-linen) py-12 px-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-(--zova-text-muted)">Please log in to view your account</p>
          <Link href="/login" className="font-semibold text-(--zova-primary-action) hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-(--zova-linen) py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-(--zova-ink)">My Account</h1>
          <p className="mt-1 text-sm text-(--zova-text-muted)">{user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          {NAV_SECTIONS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-2 rounded-2xl border border-(--zova-border) bg-white p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(25,27,25,0.08)]"
            >
              <Icon className="h-5 w-5 text-(--zova-primary-action)" />
              <div>
                <p className="font-semibold text-(--zova-ink)">{label}</p>
                <p className="text-xs text-(--zova-text-muted)">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-(--zova-border) bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-(--zova-ink)">Member since</p>
            <p className="text-xs text-(--zova-text-muted)">
              {new Date(user.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-(--zova-border) px-4 py-2 text-sm font-medium text-(--zova-ink) transition-colors hover:bg-(--zova-surface-alt)"
          >
            <FiLogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

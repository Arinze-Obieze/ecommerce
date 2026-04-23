'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hiddenRoutes = ['/login', '/signup', '/register', '/forgot-password', '/reset-password'];
  if (
    hiddenRoutes.includes(pathname) ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/store/dashboard')
  ) {
    return null;
  }

  return <Footer />;
}

'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import { HIDDEN_HEADER_ROUTES } from '@/components/layout/header/header.constants';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (
    HIDDEN_HEADER_ROUTES.includes(pathname) ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/store/dashboard')
  ) {
    return null;
  }

  return <Footer />;
}

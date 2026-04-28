'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import { HIDDEN_HEADER_ROUTES } from '@/components/layout/header/header.constants';

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (
    HIDDEN_HEADER_ROUTES.includes(pathname) ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/store/dashboard')
  ) {
    return null;
  }

  return <Header />;
}

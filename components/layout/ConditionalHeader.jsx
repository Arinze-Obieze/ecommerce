'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
// ConditionalHeader.jsx
if (pathname?.startsWith('/admin') || pathname?.startsWith('/store/dashboard')) return null;
  return <Header />;
}

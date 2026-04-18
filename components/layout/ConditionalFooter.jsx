'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
 // ConditionalHeader.jsx
if (pathname?.startsWith('/admin') || pathname?.startsWith('/store/dashboard')) return null;
  return <Footer />;
}

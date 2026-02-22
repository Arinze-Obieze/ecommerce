'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminNav from '@/components/Admin/AdminNav';

export default function AdminShell({ userEmail, roleLabel, children }) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-2xl border border-[#dbe7e0] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2E5C45]">Admin Control Center</p>
              <h1 className="text-2xl font-bold text-gray-900">Operations & Risk Console</h1>
            </div>
            <button
              type="button"
              aria-expanded={isNavOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setIsNavOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dbe7e0] px-3 py-2 text-sm font-semibold text-[#2E5C45] lg:hidden"
            >
              {isNavOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
              Menu
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{userEmail}</p>
            <p className="capitalize">Role: {roleLabel}</p>
          </div>
        </div>

        {isNavOpen ? (
          <div className="fixed inset-0 z-[140] bg-black/30 lg:hidden" onClick={() => setIsNavOpen(false)} />
        ) : null}

        <div
          id="admin-mobile-nav"
          className={`fixed inset-y-0 left-0 z-[150] w-[280px] transform border-r border-[#dbe7e0] bg-white p-4 shadow-lg transition-transform lg:hidden ${
            isNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Navigation</h2>
            <button
              type="button"
              onClick={() => setIsNavOpen(false)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <AdminNav />
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Link href="/" className="text-sm font-semibold text-[#2E5C45] hover:text-[#254a38]">
              Back to storefront
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:block">
            <AdminNav />
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link href="/" className="text-sm font-semibold text-[#2E5C45] hover:text-[#254a38]">
                Back to storefront
              </Link>
            </div>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </main>
    </div>
  );
}

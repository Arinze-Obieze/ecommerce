'use client';

import { FiMenu } from 'react-icons/fi';

export default function AdminShellTopbar({ initials, onOpenMobileMenu }) {
  return (
    <header className="zova-ops-topbar h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Open navigation"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-text">Operations & Risk Console</h1>
          <p className="text-[10px] text-text-light font-medium uppercase tracking-[0.18em] hidden sm:block">
            Control centre
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="zova-admin-live-pill hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse block" />
          <span className="text-[10px] font-semibold text-[#b87800] uppercase tracking-wide">Live</span>
        </div>
        <div className="zova-admin-avatar w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}

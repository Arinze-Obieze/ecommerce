'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight, FiHome } from 'react-icons/fi';
import StoreNav from '@/components/store-console/StoreNav';

function formatRole(role) {
  return String(role || '').split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default function StoreShell({ storeName, role, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const initials = (storeName || 'ST').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        .store-root { font-family: var(--zova-font-sans); }
        .store-sidebar { transition: width 280ms cubic-bezier(.4,0,.2,1); }
        .store-content { transition: margin-left 280ms cubic-bezier(.4,0,.2,1); }
        .store-tooltip { opacity:0; transform:translateX(-6px); pointer-events:none; transition: opacity 150ms, transform 150ms; }
        .store-nav-item:hover .store-tooltip { opacity:1; transform:translateX(0); pointer-events:auto; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }
      `}</style>

      <div className="store-root zova-ops-shell flex min-h-screen">

        {/* ══ DESKTOP SIDEBAR ══════════════════════════════════════════ */}
        <aside
          className={`zova-ops-sidebar store-sidebar hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 overflow-hidden
            ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
        >
          {/* Brand */}
          <div className={`flex items-center h-14 border-b shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}`}
            style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #2E6417, #245213)', boxShadow: '0 10px 20px rgba(46,100,23,0.22)' }}>
              <span className="text-white font-black text-xs tracking-[0.18em]">Z</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm leading-none tracking-tight truncate">{storeName || 'My Store'}</p>
                <p className="text-[10px] font-medium mt-1 uppercase tracking-[0.18em]" style={{ color: 'var(--zova-accent-emphasis)' }}>Store Console</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
            <StoreNav collapsed={collapsed} />
          </div>

          {/* Bottom */}
          <div className="shrink-0 border-t p-2 space-y-1" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            {!collapsed ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,.04)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2E6417, #245213)' }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-[11px] font-medium truncate leading-none">{storeName}</p>
                  <p className="text-white/30 text-[9px] capitalize mt-0.5">{formatRole(role)}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #2E6417, #245213)' }}>
                  {initials}
                </div>
              </div>
            )}

            <button onClick={() => setCollapsed(v => !v)}
              className={`w-full flex items-center rounded-lg py-1.5 text-white/25 hover:text-white/60 transition-colors
                ${collapsed ? 'justify-center' : 'gap-2 px-2'}`}>
              {collapsed
                ? <FiChevronRight className="w-3.5 h-3.5" />
                : <><FiChevronLeft className="w-3.5 h-3.5" /><span className="text-[11px]">Collapse</span></>
              }
            </button>

            {!collapsed && (
              <Link href="/" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/25 hover:text-white/60 transition-colors text-[11px]">
                <FiHome className="w-3 h-3 shrink-0" />
                Back to storefront
              </Link>
            )}
          </div>
        </aside>

        {/* ══ MOBILE DRAWER ════════════════════════════════════════════ */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
        <aside className={`zova-ops-sidebar fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col lg:hidden transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-14 px-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #2E6417, #245213)' }}>
                <span className="text-white font-black text-xs tracking-[0.18em]">Z</span>
              </div>
              <p className="text-white font-semibold text-sm truncate">{storeName || 'My Store'}</p>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white/80 p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            <StoreNav collapsed={false} />
          </div>
          <div className="shrink-0 border-t p-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #2E6417, #245213)' }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-medium truncate">{storeName}</p>
                <p className="text-white/30 text-[10px]">{formatRole(role)}</p>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs py-1">
              <FiHome className="w-3.5 h-3.5 shrink-0" />
              Back to storefront
            </Link>
          </div>
        </aside>

        {/* ══ MAIN ═════════════════════════════════════════════════════ */}
        <div className={`store-content flex-1 flex flex-col min-h-screen min-w-0
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[248px]'}`}>

          {/* Top bar */}
          <header className="zova-ops-topbar h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-tight">{storeName || 'My Store'}</h1>
                <p className="text-[10px] text-[#6B6B6B] font-medium uppercase tracking-[0.18em] hidden sm:block">Seller workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: 'rgba(236,156,0,.12)', border: '1px solid rgba(236,156,0,.24)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC9C00] animate-pulse block" />
                <span className="text-[10px] font-semibold text-[#b87800] uppercase tracking-wide">{formatRole(role)}</span>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, #2E6417, #245213)' }}>
                {initials}
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

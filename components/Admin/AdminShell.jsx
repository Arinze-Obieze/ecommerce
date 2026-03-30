'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight, FiHome } from 'react-icons/fi';
import AdminNav from '@/components/Admin/AdminNav';

export default function AdminShell({ userEmail, roleLabel, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const initials = (userEmail || 'AD').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        .admin-root { font-family: 'Geist', system-ui, sans-serif; }
        .sidebar-transition { transition: width 280ms cubic-bezier(.4,0,.2,1); }
        .content-transition { transition: margin-left 280ms cubic-bezier(.4,0,.2,1); }
        .nav-tooltip {
          opacity: 0; transform: translateX(-6px); pointer-events: none;
          transition: opacity 150ms, transform 150ms;
        }
        .nav-item-wrap:hover .nav-tooltip { opacity: 1; transform: translateX(0); pointer-events: auto; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }
      `}</style>

      <div className="admin-root flex min-h-screen bg-[#f4f5f7]">

        {/* ══ DESKTOP SIDEBAR ══════════════════════════════════════════ */}
        <aside
          className={`sidebar-transition hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 overflow-hidden
            ${collapsed ? 'w-[64px]' : 'w-[220px]'}`}
          style={{ background: 'linear-gradient(180deg, #111827 0%, #0d1420 100%)', borderRight: '1px solid rgba(255,255,255,.06)' }}
        >
          {/* Brand */}
          <div className={`flex items-center h-14 border-b shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}`}
            style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {!collapsed && (
              <div>
                <p className="text-white font-semibold text-sm leading-none tracking-tight">XoalAdmin</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: '#10b981' }}>Operations</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
            <AdminNav collapsed={collapsed} />
          </div>

          {/* Bottom */}
          <div className="shrink-0 border-t p-2 space-y-1" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            {/* User row */}
            {!collapsed ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,.04)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-[11px] font-medium truncate leading-none">{userEmail}</p>
                  <p className="text-white/30 text-[9px] capitalize mt-0.5">{roleLabel}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {initials}
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button onClick={() => setCollapsed(v => !v)}
              className={`w-full flex items-center rounded-lg py-1.5 text-white/25 hover:text-white/60 transition-colors
                ${collapsed ? 'justify-center' : 'gap-2 px-2'}`}
              style={{ background: 'none' }}>
              {collapsed
                ? <FiChevronRight className="w-3.5 h-3.5" />
                : <><FiChevronLeft className="w-3.5 h-3.5" /><span className="text-[11px]">Collapse</span></>
              }
            </button>

            {!collapsed && (
              <Link href="/"
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/25 hover:text-white/60 transition-colors text-[11px]`}>
                <FiHome className="w-3 h-3 shrink-0" />
                Back to storefront
              </Link>
            )}
          </div>
        </aside>

        {/* ══ MOBILE DRAWER ═══════════════════════════════════════════ */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
        <aside className={`fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col lg:hidden transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'linear-gradient(180deg, #111827 0%, #0d1420 100%)', borderRight: '1px solid rgba(255,255,255,.06)' }}>
          <div className="flex items-center justify-between h-14 px-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-white font-semibold text-sm">XoalAdmin</p>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white/80 p-1 rounded-lg hover:bg-white/10 transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            <AdminNav collapsed={false} />
          </div>
          <div className="shrink-0 border-t p-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-medium truncate">{userEmail}</p>
                <p className="text-white/30 text-[10px] capitalize">{roleLabel}</p>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs py-1">
              <FiHome className="w-3.5 h-3.5 shrink-0" />
              Back to storefront
            </Link>
          </div>
        </aside>

        {/* ══ MAIN ════════════════════════════════════════════════════ */}
        <div className={`content-transition flex-1 flex flex-col min-h-screen min-w-0
          ${collapsed ? 'lg:ml-[64px]' : 'lg:ml-[220px]'}`}>

          {/* Top bar */}
          <header className="h-14 bg-white border-b border-black/[.06] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Operations & Risk Console</h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest hidden sm:block">Admin Control Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Live</span>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
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
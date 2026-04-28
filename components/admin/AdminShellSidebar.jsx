'use client';

import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiHome, FiX } from 'react-icons/fi';
import AdminNav from '@/components/admin/AdminNav';
import BrandMark from '@/components/brand/BrandMark';

function AdminIdentity({ collapsed, initials, roleLabel, userEmail }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-1">
        <div className="zova-admin-avatar w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="zova-admin-user-card flex items-center gap-2 px-2 py-1.5 rounded-lg">
      <div className="zova-admin-avatar w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="zova-admin-sidebar-label text-[11px] font-medium truncate leading-none">{userEmail}</p>
        <p className="zova-admin-sidebar-meta text-[9px] capitalize mt-0.5">{roleLabel}</p>
      </div>
    </div>
  );
}

function AdminSidebarContent({
  collapsed = false,
  initials,
  roleLabel,
  showCloseButton = false,
  userEmail,
  onClose,
  onToggleCollapse,
}) {
  return (
    <>
      <div
        className={`zova-admin-shell-line flex items-center h-14 border-b shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark
            dark
            iconOnly={collapsed}
            className={collapsed ? 'h-9 w-9 shrink-0' : 'h-9 w-[110px] shrink-0'}
          />
          {!collapsed && (
            <div>
              <p className="text-white font-semibold text-sm leading-none tracking-tight">ZOVA Admin</p>
              <p className="text-[10px] font-medium mt-1 uppercase tracking-[0.18em] text-accent">Operations</p>
            </div>
          )}
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-white/40 hover:text-white/80 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="zova-admin-scroll flex-1 overflow-y-auto overflow-x-hidden py-3">
        <AdminNav collapsed={collapsed} />
      </div>

      <div className="zova-admin-shell-line shrink-0 border-t p-2 space-y-1">
        <AdminIdentity collapsed={collapsed} initials={initials} roleLabel={roleLabel} userEmail={userEmail} />

        {typeof onToggleCollapse === 'function' && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`zova-admin-sidebar-action w-full flex items-center rounded-lg py-1.5 transition-colors ${collapsed ? 'justify-center' : 'gap-2 px-2'}`}
          >
            {collapsed ? (
              <FiChevronRight className="w-3.5 h-3.5" />
            ) : (
              <>
                <FiChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px]">Collapse</span>
              </>
            )}
          </button>
        )}

        {!collapsed && (
          <Link
            href="/"
            className="zova-admin-sidebar-action flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-[11px]"
          >
            <FiHome className="w-3 h-3 shrink-0" />
            Back to storefront
          </Link>
        )}
      </div>
    </>
  );
}

export function AdminDesktopSidebar({
  collapsed,
  initials,
  roleLabel,
  userEmail,
  onToggleCollapse,
}) {
  return (
    <aside
      className={`zova-ops-sidebar zova-admin-desktop-sidebar hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 overflow-hidden ${collapsed ? 'is-collapsed' : ''}`}
    >
      <AdminSidebarContent
        collapsed={collapsed}
        initials={initials}
        roleLabel={roleLabel}
        userEmail={userEmail}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}

export function AdminMobileSidebar({
  mobileOpen,
  initials,
  roleLabel,
  userEmail,
  onClose,
}) {
  return (
    <>
      {mobileOpen && (
        <div className="zova-admin-mobile-backdrop fixed inset-0 z-40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`zova-ops-sidebar zova-admin-mobile-sidebar fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <AdminSidebarContent
          initials={initials}
          roleLabel={roleLabel}
          userEmail={userEmail}
          showCloseButton
          onClose={onClose}
        />
      </aside>
    </>
  );
}

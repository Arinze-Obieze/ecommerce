'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminDesktopSidebar, AdminMobileSidebar } from '@/components/admin/AdminShellSidebar';
import AdminShellTopbar from '@/components/admin/AdminShellTopbar';
import MfaGate from '@/components/shared/MfaGate';

const MFA_SETUP_PATH = '/admin/mfa-setup';

export default function AdminShell({ userEmail, roleLabel, mfaEnrolled = false, needsMfa = false, children }) {
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
    <div className="zova-ops-shell flex min-h-screen">
      <AdminDesktopSidebar
        collapsed={collapsed}
        initials={initials}
        roleLabel={roleLabel}
        userEmail={userEmail}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      <AdminMobileSidebar
        mobileOpen={mobileOpen}
        initials={initials}
        roleLabel={roleLabel}
        userEmail={userEmail}
        onClose={() => setMobileOpen(false)}
      />

      <div className={`zova-admin-shell-main flex-1 flex flex-col min-h-screen min-w-0 ${collapsed ? 'is-collapsed' : ''}`}>
        <AdminShellTopbar initials={initials} onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <MfaGate
            mode={
              pathname === MFA_SETUP_PATH ? null
                : needsMfa ? 'challenge'
                : !mfaEnrolled ? 'enroll'
                : null
            }
            confirmUrl="/api/admin/mfa/confirm-enrollment"
          >
            {children}
          </MfaGate>
        </main>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiUsers, FiFileText, FiBarChart2,
  FiShoppingBag, FiPackage, FiCreditCard, FiRefreshCw, FiSliders, FiStar, FiShield
} from 'react-icons/fi';

const groups = [
  {
    label: 'Main',
    items: [
      { href: '/admin',           label: 'Overview',      icon: FiGrid },
      { href: '/admin/stores',    label: 'Stores',        icon: FiUsers },
      { href: '/admin/orders',    label: 'Orders',        icon: FiShoppingBag },
      { href: '/admin/products',  label: 'Products',      icon: FiPackage },
      { href: '/admin/reviews',   label: 'Reviews',       icon: FiStar },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/escrow',    label: 'Escrow',        icon: FiCreditCard },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/return-policy',   label: 'Return Policy',  icon: FiRefreshCw },
      { href: '/admin/logs',            label: 'System Logs',    icon: FiFileText },
      { href: '/admin/analytics',       label: 'Analytics',      icon: FiBarChart2 },
      { href: '/admin/ranking-debug',   label: 'Ranking Debug',  icon: FiSliders },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/admin/mfa-setup', label: '2FA Setup', icon: FiShield },
    ],
  },
];

const COLOR_INACTIVE = 'rgba(255,255,255,0.82)';
const COLOR_ACTIVE   = '#ffffff';

export default function AdminNav({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <nav className="px-2 space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="zova-admin-nav-group text-[9px] font-bold uppercase tracking-[.14em] px-2 pb-1.5">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href} className="zova-admin-nav-item relative">
                  <Link
                    href={item.href}
                    className={`zova-admin-nav-link flex items-center rounded-lg transition-all duration-150 relative
                      ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-2.5 py-2'}
                      ${active ? 'is-active' : ''}`}
                  >
                    {active && !collapsed && (
                      <span className="zova-admin-nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r" />
                    )}
                    <Icon style={{ width: collapsed ? 18 : 15, height: collapsed ? 18 : 15, flexShrink: 0 }} />
                    {!collapsed && (
                      <span className="text-[13px] leading-none" style={{ fontWeight: active ? 600 : 400 }}>
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {collapsed && (
                    <div className="zova-admin-nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
                      <div className="zova-admin-nav-tooltip-card px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap shadow-xl">
                        {item.label}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

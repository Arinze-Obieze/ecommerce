'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiUsers, FiFileText, FiBarChart2,
  FiShoppingBag, FiPackage, FiCreditCard, FiRefreshCw, FiSliders
} from 'react-icons/fi';

const groups = [
  {
    label: 'Main',
    items: [
      { href: '/admin',           label: 'Overview',    icon: FiGrid },
      { href: '/admin/stores',    label: 'Stores',      icon: FiUsers },
      { href: '/admin/orders',    label: 'Orders',      icon: FiShoppingBag },
      { href: '/admin/products',  label: 'Products',    icon: FiPackage },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/escrow',    label: 'Escrow',      icon: FiCreditCard },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/return-policy', label: 'Return Policy', icon: FiRefreshCw },
      { href: '/admin/logs',      label: 'System Logs', icon: FiFileText },
      { href: '/admin/analytics', label: 'Analytics',   icon: FiBarChart2 },
      { href: '/admin/ranking-debug', label: 'Ranking Debug', icon: FiSliders },
    ],
  },
];

export default function AdminNav({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <nav className="px-2 space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-[.14em] px-2 pb-1.5"
              style={{ color: 'rgba(255,255,255,.28)' }}>
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href} className="nav-item-wrap relative">
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg transition-all duration-150 relative
                      ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-2.5 py-2'}
                      ${active
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/75'
                      }`}
                    style={active ? {
                      background: 'rgba(46,100,23,.22)',
                      boxShadow: 'inset 0 0 0 1px rgba(46,100,23,.24)'
                    } : {}}
                  >
                    {/* Active left bar */}
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                        style={{ background: 'var(--zova-accent-emphasis)' }} />
                    )}
                    <Icon className={`shrink-0 ${collapsed ? 'w-4.5 h-4.5' : 'w-4 h-4'}`}
                      style={{ width: collapsed ? 18 : 15, height: collapsed ? 18 : 15 }} />
                    {!collapsed && (
                      <span className={`text-[13px] leading-none ${active ? 'font-semibold text-white' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
                      <div className="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap shadow-xl"
                        style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,.1)' }}>
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

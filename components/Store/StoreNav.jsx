'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiUsers, FiPackage, FiShoppingBag,
  FiBarChart2, FiCreditCard, FiSettings
} from 'react-icons/fi';

const groups = [
  {
    label: 'Main',
    items: [
      { href: '/store/dashboard',            label: 'Overview',   icon: FiGrid },
      { href: '/store/dashboard/products',   label: 'Products',   icon: FiPackage },
      { href: '/store/dashboard/orders',     label: 'Orders',     icon: FiShoppingBag },
      { href: '/store/dashboard/inventory',  label: 'Inventory',  icon: FiPackage },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/store/dashboard/analytics',  label: 'Analytics',  icon: FiBarChart2 },
      { href: '/store/dashboard/payouts',    label: 'Payouts',    icon: FiCreditCard },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/store/dashboard/settings',   label: 'Settings',   icon: FiSettings },
      { href: '/store/dashboard/team',       label: 'Team',       icon: FiUsers },
    ],
  },
];

export default function StoreNav({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <nav className="px-2 space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-[.14em] px-2 pb-1.5"
              style={{ color: 'rgba(255,255,255,.2)' }}>
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/store/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href} className="store-nav-item relative">
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg transition-all duration-150 relative
                      ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2.5 px-2.5 py-2'}
                      ${active ? 'text-white' : 'text-white/40 hover:text-white/75'}`}
                    style={active ? {
                      background: 'rgba(16,185,129,.15)',
                      boxShadow: 'inset 0 0 0 1px rgba(16,185,129,.15)'
                    } : {}}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                        style={{ background: '#10b981' }} />
                    )}
                    <Icon
                      className={`shrink-0 ${active ? 'text-emerald-400' : ''}`}
                      style={{ width: collapsed ? 18 : 15, height: collapsed ? 18 : 15 }}
                    />
                    {!collapsed && (
                      <span className={`text-[13px] leading-none ${active ? 'font-semibold text-white' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {collapsed && (
                    <div className="store-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
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
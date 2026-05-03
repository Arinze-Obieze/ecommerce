'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiArrowUpRight, FiBriefcase, FiShield } from 'react-icons/fi';
import { useAuth } from '@/components/auth/AuthProvider';

function shouldHide(pathname) {
  if (!pathname) return true;
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/store/dashboard') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  );
}

export default function FloatingDashboardCTA() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    let active = true;

    async function resolveDestination() {
      if (!user?.id || shouldHide(pathname)) {
        if (active) setDestination(null);
        return;
      }

      try {
        const response = await fetch('/api/auth/post-login-target', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!active) return;

        if (payload?.target === '/admin') {
          setDestination({
            href:   '/admin',
            label:  'Back to Admin',
            detail: 'Open superadmin workspace',
            icon:   FiShield,
            accent: 'from-primary-hover to-primary',
            ring:   'ring-[#B8D4A0]/70',
            dot:    'var(--zova-accent-emphasis)',
          });
          return;
        }

        if (payload?.target === '/store/dashboard') {
          setDestination({
            href:   '/store/dashboard',
            label:  'Back to Store',
            detail: 'Return to seller dashboard',
            icon:   FiBriefcase,
            accent: 'from-primary to-primary',
            ring:   'ring-[#B8D4A0]/70',
            dot:    'var(--zova-accent-emphasis)',
          });
          return;
        }
      } catch {
        // Best effort UI affordance only.
      }

      if (active) setDestination(null);
    }

    resolveDestination();
    return () => { active = false; };
  }, [pathname, user?.id]);

  if (loading || !destination || shouldHide(pathname)) return null;

  const Icon = destination.icon;

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6">
      <Link
        href={destination.href}
        className={`pointer-events-auto flex items-center gap-2.5 rounded-xl bg-gradient-to-br ${destination.accent} px-3.5 py-2.5 text-white shadow-[0_12px_30px_rgba(46,100,23,0.25)] ring-1 ${destination.ring} backdrop-blur transition-transform duration-200 hover:-translate-y-1`}
      >
        {/* Icon bubble */}
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </span>

        {/* Text */}
        <span className="min-w-0">
          <span className="block text-xs font-bold leading-tight">{destination.label}</span>
          <span className="block text-[10px] text-white/75 leading-tight mt-0.5">{destination.detail}</span>
        </span>

        {/* Gold harvest arrow */}
        <FiArrowUpRight
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: destination.dot }}
        />
      </Link>
    </div>
  );
}

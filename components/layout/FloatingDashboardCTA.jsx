'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiArrowUpRight, FiBriefcase, FiShield } from 'react-icons/fi';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/utils/supabase/client';

function rolePriority(role) {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'owner')   return 3;
  if (normalized === 'manager') return 2;
  if (normalized === 'staff')   return 1;
  return 0;
}

function pickBestStoreMembership(memberships) {
  if (!Array.isArray(memberships) || memberships.length === 0) return null;
  return [...memberships].sort((a, b) => {
    const priorityDiff = rolePriority(b.role) - rolePriority(a.role);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })[0];
}

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

      const supabase = createClient();

      // Check superadmin
      const { data: adminMembership, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!active) return;

      if (!adminError && adminMembership?.role) {
        setDestination({
          href:   '/admin',
          label:  'Back to Admin',
          detail: 'Open superadmin workspace',
          icon:   FiShield,
          // Zova Forest gradient
          accent: 'from-primary-hover to-primary',
          ring:   'ring-[#B8D4A0]/70',
          dot:    'var(--zova-accent-emphasis)',   // Gold Harvest dot accent
        });
        return;
      }

      // Check store membership
      const { data: storeMemberships, error: storeError } = await supabase
        .from('store_users')
        .select('role, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (!active) return;

      const storeMembership = pickBestStoreMembership(storeMemberships || []);

      if (!storeError && storeMembership?.role) {
        setDestination({
          href:   '/store/dashboard',
          label:  'Back to Store',
          detail: 'Return to seller dashboard',
          icon:   FiBriefcase,
          // Zova Forest → Gold Harvest gradient
          accent: 'from-primary to-primary',
          ring:   'ring-[#B8D4A0]/70',
          dot:    'var(--zova-accent-emphasis)',
        });
        return;
      }

      setDestination(null);
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
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 flex-shrink-0">
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
"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiUsers,
} from 'react-icons/fi';
import { getStores } from '@/features/storefront/stores/api/client';

const LIMIT = 12;

function toPage(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildStoreHref(store) {
  return `/store/${store.slug || store.id}`;
}

function StoreCard({ store }) {
  const href = buildStoreHref(store);

  return (
    <article className="bg-white rounded-[4px] p-5 sm:p-6 border transition-all hover:-translate-y-1 hover:border-[#B8D4A0]" style={{ borderColor: 'var(--zova-border)', boxShadow: 'var(--zova-shadow-card)' }}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={href}
            aria-label={`Open ${store.name}`}
            className="w-16 h-16 rounded-[4px] border flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--zova-surface-alt)', borderColor: 'var(--zova-border)' }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color: 'var(--zova-text-muted)' }}>
                {String(store.name || 'S').charAt(0).toUpperCase()}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link href={href} className="min-w-0">
                <h2 className="truncate text-lg font-bold transition-colors hover:text-(--zova-primary-action)" style={{ color: 'var(--zova-ink)' }}>
                  {store.name}
                </h2>
              </Link>
              {store.kyc_status === 'verified' && (
                <FiCheckCircle className="h-4 w-4 shrink-0 text-(--zova-primary-action)" title="Verified Store" />
              )}
            </div>
            <p className="mt-1 min-h-[40px] text-sm line-clamp-2" style={{ color: 'var(--zova-text-body)' }}>
              {store.description || 'Welcome to our store. We offer high quality products.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid var(--zova-border)` }}>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-[2px]" style={{ backgroundColor: 'var(--zova-accent-soft)' }}>
              <FiStar className="h-3.5 w-3.5 fill-current text-(--zova-accent-emphasis)" />
            </div>
            <span className="font-semibold text-(--zova-ink)">{store.rating || 'New'}</span>
            {store.rating && <span className="text-(--zova-text-muted)">Rating</span>}
          </div>
        </div>

        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-[4px] bg-(--zova-primary-action) px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--zova-primary-action-hover)"
        >
          Open Store <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function PageButton({ page, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-current={active ? 'page' : undefined}
      className={`h-9 min-w-9 rounded-[4px] border px-3 text-sm font-semibold transition-colors ${
        active
          ? 'bg-(--zova-primary-action) text-white'
          : 'bg-white text-(--zova-ink) hover:text-(--zova-primary-action)'
      }`}
      style={{ borderColor: active ? 'var(--zova-primary-action)' : 'var(--zova-border)' }}
    >
      {page}
    </button>
  );
}

function getVisiblePages(page, totalPages) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export default function StoresDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = toPage(searchParams.get('page'));
  const sort = searchParams.get('sort') || 'top';
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState({
    page,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    sort,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const visiblePages = useMemo(() => getVisiblePages(meta.page, meta.totalPages), [meta.page, meta.totalPages]);

  const setPage = useCallback(
    (nextPage) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(nextPage));
      if (sort && sort !== 'top') params.set('sort', sort);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, sort]
  );

  useEffect(() => {
    let active = true;

    async function loadStores() {
      setLoading(true);
      setError('');

      try {
        const json = await getStores({ page, limit: LIMIT, sort });
        if (!active) return;
        setStores(json.data || []);
        setMeta(json.meta || {});
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load stores');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStores();

    return () => {
      active = false;
    };
  }, [page, sort]);

  return (
    <div>
      {error ? (
        <div className="rounded-[4px] border border-(--zova-error) bg-white p-8 text-center text-(--zova-error)">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-[4px] border bg-white" style={{ borderColor: 'var(--zova-border)' }} />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-[4px] bg-white p-8 text-center text-(--zova-text-muted)">No active stores found.</div>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: 'var(--zova-text-muted)' }}>
            <span>
              Showing page <strong className="text-(--zova-ink)">{meta.page}</strong> of{' '}
              <strong className="text-(--zova-ink)">{meta.totalPages}</strong>
            </span>
            <span>{meta.total.toLocaleString()} active stores</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Stores pagination">
              <button
                type="button"
                onClick={() => setPage(meta.page - 1)}
                disabled={!meta.hasPreviousPage}
                className="inline-flex h-9 items-center gap-1 rounded-[4px] border bg-white px-3 text-sm font-semibold text-(--zova-ink) transition-colors hover:border-[#B8D4A0] hover:text-(--zova-primary-action) disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: 'var(--zova-border)' }}
              >
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>

              {visiblePages.map((pageNumber, index) => {
                const previous = visiblePages[index - 1];
                return (
                  <span key={pageNumber} className="inline-flex items-center gap-2">
                    {previous && pageNumber - previous > 1 && <span className="text-gray-400">...</span>}
                    <PageButton page={pageNumber} active={pageNumber === meta.page} onClick={setPage} />
                  </span>
                );
              })}

              <button
                type="button"
                onClick={() => setPage(meta.page + 1)}
                disabled={!meta.hasNextPage}
                className="inline-flex h-9 items-center gap-1 rounded-[4px] border bg-white px-3 text-sm font-semibold text-(--zova-ink) transition-colors hover:border-[#B8D4A0] hover:text-(--zova-primary-action) disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: 'var(--zova-border)' }}
              >
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

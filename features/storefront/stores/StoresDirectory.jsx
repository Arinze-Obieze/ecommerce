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
    <article className="bg-white rounded-xl p-5 border transition-all hover:-translate-y-1" style={{ borderColor: 'var(--zova-border)', boxShadow: 'var(--zova-shadow-card)' }}>
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 flex-1">
          {/* Left side: Avatar */}
          <Link
            href={href}
            aria-label={`Open ${store.name}`}
            className="w-[52px] h-[52px] rounded-xl border flex items-center justify-center shrink-0 overflow-hidden" 
            style={{ backgroundColor: 'var(--zova-green-soft)', borderColor: 'var(--zova-border)' }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold" style={{ color: 'var(--zova-primary-action)' }}>
                {String(store.name || 'Z').charAt(0).toUpperCase()}
              </span>
            )}
          </Link>

          {/* Right side: Details */}
          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
            <Link href={href} className="min-w-0">
              <h2 className="truncate text-lg font-semibold transition-colors hover:text-(--zova-primary-action)" style={{ color: 'var(--zova-ink)' }}>
                {store.name}
              </h2>
            </Link>
            <p className="text-sm truncate" style={{ color: '#4a4a4a' }}>
              {store.description || 'Premium quality products, trusted seller.'}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm">
                <FiStar className="h-4 w-4 fill-current text-(--zova-accent-emphasis)" />
                <span className="font-semibold" style={{ color: 'var(--zova-ink)' }}>{store.rating || 'New'}</span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={href}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--zova-primary-action) px-4 py-3 text-sm font-bold transition-colors hover:bg-(--zova-primary-action-hover)"
          style={{ color: '#ffffff' }}
        >
          Open Store
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
          <div className="mb-8 flex justify-center w-full">
            <div className="inline-flex items-center gap-1.5 pb-1 border-b-[2px] text-sm font-medium" style={{ borderColor: 'var(--zova-gold)', color: '#4a4a4a' }}>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <span className="font-black">&middot;</span>
              <span>{meta.total.toLocaleString()} active stores</span>
            </div>
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

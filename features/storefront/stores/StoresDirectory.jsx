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
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={href}
            aria-label={`Open ${store.name}`}
            className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden"
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-gray-400">
                {String(store.name || 'S').charAt(0).toUpperCase()}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link href={href} className="min-w-0">
                <h2 className="truncate text-lg font-bold text-gray-900 transition-colors hover:text-[#2E6417]">
                  {store.name}
                </h2>
              </Link>
              {store.kyc_status === 'verified' && (
                <FiCheckCircle className="h-4 w-4 shrink-0 text-blue-500" title="Verified Store" />
              )}
            </div>
            <p className="mt-1 min-h-[40px] text-sm text-gray-500 line-clamp-2">
              {store.description || 'Welcome to our store. We offer high quality products.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
              <FiStar className="h-3.5 w-3.5 fill-current text-yellow-600" />
            </div>
            <span className="font-semibold text-gray-900">{store.rating || 'New'}</span>
            {store.rating && <span className="text-gray-500">Rating</span>}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <FiUsers className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{store.followers || 0}</span>
            <span>Followers</span>
          </div>
        </div>

        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#2E6417] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#245213]"
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
      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition-colors ${
        active
          ? 'border-[#2E6417] bg-[#2E6417] text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#2E6417] hover:text-[#2E6417]'
      }`}
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
        <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-red-500">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500">No active stores found.</div>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing page <strong className="text-gray-900">{meta.page}</strong> of{' '}
              <strong className="text-gray-900">{meta.totalPages}</strong>
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
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#2E6417] hover:text-[#2E6417] disabled:cursor-not-allowed disabled:opacity-45"
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
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#2E6417] hover:text-[#2E6417] disabled:cursor-not-allowed disabled:opacity-45"
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

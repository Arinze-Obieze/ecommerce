import { paginationMeta, toPositiveInt } from '@/utils/platform/pagination';

const STORE_SELECT = [
  'id',
  'name',
  'slug',
  'logo_url',
  'rating',
  'followers',
  'kyc_status',
  'description',
].join(', ');

const SORTS = {
  top: [
    { column: 'rating', ascending: false, nullsFirst: false },
    { column: 'followers', ascending: false, nullsFirst: false },
  ],
  newest: [
    { column: 'created_at', ascending: false, nullsFirst: false },
  ],
  followers: [
    { column: 'followers', ascending: false, nullsFirst: false },
    { column: 'rating', ascending: false, nullsFirst: false },
  ],
};

export function normalizeStoreSort(value) {
  const sort = String(value || 'top').trim().toLowerCase();
  return SORTS[sort] ? sort : 'top';
}

export async function listPublicStores(supabase, { page = 1, limit = 12, sort = 'top' } = {}) {
  const normalizedPage = toPositiveInt(page, 1, { min: 1, max: 500 });
  const normalizedLimit = toPositiveInt(limit, 12, { min: 1, max: 48 });
  const normalizedSort = normalizeStoreSort(sort);
  const from = (normalizedPage - 1) * normalizedLimit;
  const to = from + normalizedLimit - 1;

  let query = supabase
    .from('stores')
    .select(STORE_SELECT, { count: 'exact' })
    .eq('status', 'active');

  for (const order of SORTS[normalizedSort]) {
    query = query.order(order.column, {
      ascending: order.ascending,
      nullsFirst: order.nullsFirst,
    });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    meta: {
      ...paginationMeta({ page: normalizedPage, limit: normalizedLimit, total: count || 0 }),
      sort: normalizedSort,
    },
  };
}

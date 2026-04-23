export function toPositiveInt(value, fallback, { min = 1, max = 100 } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function getPagination(searchParams, { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = toPositiveInt(searchParams.get('page'), defaultPage, { min: 1, max: 10000 });
  const limit = toPositiveInt(searchParams.get('limit'), defaultLimit, { min: 1, max: maxLimit });
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to, offset: from };
}

export function paginationMeta({ page, limit, total }) {
  const safeTotal = Math.max(0, Number(total || 0));
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));
  const safePage = Math.min(Math.max(1, Number(page || 1)), totalPages);

  return {
    page: safePage,
    limit,
    total: safeTotal,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function paginateArray(items, { page, limit }) {
  const meta = paginationMeta({ page, limit, total: items.length });
  const start = (meta.page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta,
  };
}

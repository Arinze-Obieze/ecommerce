export const ADMIN_PRODUCT_STATUS_OPTIONS = ['', 'pending_review', 'approved', 'rejected', 'draft', 'archived'];

export function formatAdminProductPrice(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export function buildAdminProductMetrics(rows = []) {
  return [
    { label: 'Total products', value: rows.length },
    { label: 'Pending review', value: rows.filter((product) => product.moderation_status === 'pending_review').length },
    { label: 'Out of stock', value: rows.filter((product) => Number(product.stock_quantity) <= 0).length },
    {
      label: 'Low stock (≤5)',
      value: rows.filter((product) => Number(product.stock_quantity) > 0 && Number(product.stock_quantity) <= 5).length,
    },
  ];
}

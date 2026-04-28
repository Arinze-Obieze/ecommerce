export function getStoreSummaryCards(productStats = {}) {
  return [
    { label: 'Products', value: productStats.total || 0 },
    { label: 'Active products', value: productStats.active || 0 },
    { label: 'Out of stock', value: productStats.outOfStock || 0 },
  ];
}

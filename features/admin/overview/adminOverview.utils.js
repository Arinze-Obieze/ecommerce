export function formatAdminOverviewCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function buildAdminOverviewCards(payload = {}) {
  const kpis = payload.kpis || {};
  const operations = payload.operations || {};

  return [
    {
      label: 'Paid GMV (30d)',
      value: formatAdminOverviewCurrency(kpis.gmvPaid),
      hint: `AOV: ${formatAdminOverviewCurrency(kpis.aovPaid)}`,
    },
    {
      label: 'Orders (30d)',
      value: kpis.totalOrders || 0,
      hint: `${kpis.paidOrders || 0} paid • ${kpis.pendingOrders || 0} pending`,
    },
    {
      label: 'Conversion Proxy',
      value: `${kpis.conversionProxy || 0}%`,
      hint: `Cancelled: ${kpis.refundOrCancelRate || 0}%`,
    },
    {
      label: 'Payment Failure Rate',
      value: `${operations.paymentFailureRate || 0}%`,
      hint: `${operations.reliabilityErrors24h || 0} critical errors/24h`,
    },
  ];
}

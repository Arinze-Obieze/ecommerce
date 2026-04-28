'use client';

import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import {
  OrderPreviewSidebar,
  OrdersFilters,
  OrdersHeader,
  OrdersStats,
  OrdersTableCard,
} from '@/features/store-console/orders/StoreOrdersSections';
import useStoreOrdersWorkspace from '@/features/store-console/orders/useStoreOrdersWorkspace';

export default function StoreOrdersPage() {
  const {
    loading,
    error,
    query,
    setQuery,
    paymentFilter,
    setPaymentFilter,
    fulfillmentFilter,
    setFulfillmentFilter,
    escrowFilter,
    setEscrowFilter,
    selectedOrderId,
    setSelectedOrderId,
    detailLoading,
    detailError,
    menuOpenForOrderId,
    setMenuOpenForOrderId,
    filteredRows,
    stats,
    detailOrder,
    detailItems,
    detailCustomer,
    detailAddress,
    detailUpdates,
    openReceipt,
    downloadReceipt,
    resetFilters,
  } = useStoreOrdersWorkspace();

  return (
    <div className="space-y-4">
      <OrdersHeader />

      <AlertBanner type="error" message={error} />

      <OrdersStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <OrdersFilters
            query={query}
            setQuery={setQuery}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            fulfillmentFilter={fulfillmentFilter}
            setFulfillmentFilter={setFulfillmentFilter}
            escrowFilter={escrowFilter}
            setEscrowFilter={setEscrowFilter}
            onReset={resetFilters}
          />

          <OrdersTableCard
            loading={loading}
            filteredRows={filteredRows}
            selectedOrderId={selectedOrderId}
            setSelectedOrderId={setSelectedOrderId}
            menuOpenForOrderId={menuOpenForOrderId}
            setMenuOpenForOrderId={setMenuOpenForOrderId}
            onOpenReceipt={openReceipt}
            onDownloadReceipt={downloadReceipt}
          />
        </div>

        <OrderPreviewSidebar
          selectedOrderId={selectedOrderId}
          detailLoading={detailLoading}
          detailError={detailError}
          detailOrder={detailOrder}
          detailCustomer={detailCustomer}
          detailItems={detailItems}
          detailAddress={detailAddress}
          detailUpdates={detailUpdates}
          onOpenReceipt={openReceipt}
        />
      </div>
    </div>
  );
}

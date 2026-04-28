'use client';

import {
  FulfillmentTimelineSection,
  FulfillmentUpdateForm,
  OrderDetailHeader,
  OrderItemsSection,
  OrderMetaSidebar,
  OrderSummaryCards,
  ReceiptSection,
  ReturnRequestForm,
} from '@/features/store-console/order-detail/StoreOrderDetailSections';
import useStoreOrderDetail from '@/features/store-console/order-detail/useStoreOrderDetail';

export default function StoreOrderDetailPage({ orderId = '' }) {
  const {
    loading,
    saving,
    returnSaving,
    error,
    notice,
    order,
    items,
    shippingAddress,
    customer,
    updates,
    cancellationRequest,
    returnRequest,
    receiptUrl,
    receiptDownloadUrl,
    form,
    setForm,
    returnForm,
    setReturnForm,
    summaryCards,
    submitFulfillmentUpdate,
    submitReturnUpdate,
  } = useStoreOrderDetail(orderId);

  if (loading) {
    return <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 text-sm text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || 'Order not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <OrderDetailHeader order={order} receiptUrl={receiptUrl} receiptDownloadUrl={receiptDownloadUrl} />

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

      <OrderSummaryCards cards={summaryCards} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <OrderItemsSection items={items} />
          <FulfillmentTimelineSection updates={updates} />
        </div>

        <div className="space-y-6">
          <OrderMetaSidebar
            cancellationRequest={cancellationRequest}
            returnRequest={returnRequest}
            customer={customer}
            shippingAddress={shippingAddress}
            order={order}
          />
          <FulfillmentUpdateForm form={form} setForm={setForm} saving={saving} onSubmit={submitFulfillmentUpdate} />
          <ReceiptSection receiptUrl={receiptUrl} receiptDownloadUrl={receiptDownloadUrl} />
          <ReturnRequestForm
            returnRequest={returnRequest}
            returnForm={returnForm}
            setReturnForm={setReturnForm}
            returnSaving={returnSaving}
            onSubmit={submitReturnUpdate}
          />
        </div>
      </div>
    </div>
  );
}

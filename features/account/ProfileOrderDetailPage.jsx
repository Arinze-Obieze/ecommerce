'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import CancellationModal from '@/features/account/order-detail/CancellationModal';
import CancellationPanel from '@/features/account/order-detail/CancellationPanel';
import DeliveryAddressCard from '@/features/account/order-detail/DeliveryAddressCard';
import NextStepsCard from '@/features/account/order-detail/NextStepsCard';
import OrderActionsBar from '@/features/account/order-detail/OrderActionsBar';
import OrderHeaderCard from '@/features/account/order-detail/OrderHeaderCard';
import OrderItemsCard from '@/features/account/order-detail/OrderItemsCard';
import OrderSummaryCard from '@/features/account/order-detail/OrderSummaryCard';
import OrderTimelineCard from '@/features/account/order-detail/OrderTimelineCard';
import ReturnRefundCard from '@/features/account/order-detail/ReturnRefundCard';
import { formatDateTime, formatMoney } from '@/features/account/order-detail/orderDetail.utils';
import useOrderDetail from '@/features/account/order-detail/useOrderDetail';

export default function ProfileOrderDetailPage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const {
    order,
    items,
    shippingAddress,
    cancellationRequest,
    returnRequest,
    cancelReason,
    cancelBusy,
    cancelModalOpen,
    returnReason,
    returnDetails,
    returnBusy,
    loading,
    error,
    status,
    itemCount,
    timeline,
    orderTotal,
    canRequestCancellation,
    canRequestReturn,
    setCancelReason,
    setCancelModalOpen,
    setReturnReason,
    setReturnDetails,
    submitCancellationRequest,
    submitReturnRequest,
  } = useOrderDetail({ orderId, userId: user?.id });

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-primary">Loading order details...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(249,250,251,0.88)' }}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <OrderActionsBar />

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <CancellationModal
          open={cancelModalOpen}
          cancelBusy={cancelBusy}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          setCancelModalOpen={setCancelModalOpen}
          submitCancellationRequest={submitCancellationRequest}
        />

        {order ? (
          <div className="space-y-6">
            <OrderHeaderCard order={order} status={status} itemCount={itemCount} formatDateTime={formatDateTime} />
            <CancellationPanel
              cancellationRequest={cancellationRequest}
              canRequestCancellation={canRequestCancellation}
              setCancelModalOpen={setCancelModalOpen}
            />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <OrderItemsCard items={items} formatMoney={formatMoney} />

              <div className="space-y-6">
                <OrderSummaryCard order={order} orderTotal={orderTotal} formatDateTime={formatDateTime} formatMoney={formatMoney} />
                <DeliveryAddressCard shippingAddress={shippingAddress} />
                <NextStepsCard />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <OrderTimelineCard timeline={timeline} formatDateTime={formatDateTime} />
              <ReturnRefundCard
                returnRequest={returnRequest}
                canRequestReturn={canRequestReturn}
                returnReason={returnReason}
                setReturnReason={setReturnReason}
                returnDetails={returnDetails}
                setReturnDetails={setReturnDetails}
                returnBusy={returnBusy}
                submitReturnRequest={submitReturnRequest}
                formatDateTime={formatDateTime}
                formatMoney={formatMoney}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--zova-border)] bg-white px-6 py-10 text-center">
            <p className="text-sm font-semibold text-[var(--zova-text-body)]">We couldn&apos;t find this order.</p>
          </div>
        )}
      </main>
    </div>
  );
}

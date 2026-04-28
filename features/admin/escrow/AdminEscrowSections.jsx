'use client';

import { ADMIN_ESCROW_TABS, money, prettifyStatus, tone } from '@/features/admin/escrow/adminEscrow.utils';

export function AdminEscrowIntro() {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Escrow Releases</h2>
      <p className="mt-1 text-sm text-gray-600">
        Review held funds, release only after delivery confirmation, and keep transfer status separate from escrow approval.
      </p>
    </div>
  );
}

export function AdminEscrowCards({ cards }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-[#E8E4DC] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminEscrowTabs({ tab, setTab }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {ADMIN_ESCROW_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === item.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminEscrowTable({ loading, error, rows, tab, busyKey, onRelease }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading escrow entries...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Store</th>
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Recipient</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const keyNow = `${row.order_id}:${row.store_id}:now`;
                const keyQueue = `${row.order_id}:${row.store_id}:queue`;
                const currentStatus = row.kind === 'escrow'
                  ? row.ready_for_release ? 'ready' : row.escrow_status
                  : row.payout_status;

                return (
                  <tr key={row.id} className="border-b border-gray-50 align-top">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{row.stores?.name || row.store_id}</div>
                      <div className="text-xs text-gray-500">{row.store_id}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{row.order_id}</div>
                      <div className="text-xs text-gray-500">{prettifyStatus(row.orders?.fulfillment_status || row.orders?.status || '-')}</div>
                    </td>
                    <td className="py-2 pr-3 font-semibold text-gray-900">{money(row.amount)}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone(currentStatus)}`}>
                        {prettifyStatus(currentStatus)}
                      </span>
                      {row.failure_reason ? <div className="mt-1 text-xs text-red-600">{row.failure_reason}</div> : null}
                    </td>
                    <td className="py-2 pr-3">
                      <div className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${row.recipient_ready ? tone('ready') : tone('failed')}`}>
                        {row.recipient_ready ? 'Recipient Ready' : prettifyStatus(row.payout_account_status || 'missing')}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{new Date(row.released_at || row.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      {row.kind === 'escrow' && row.ready_for_release ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onRelease(row, false)}
                            disabled={busyKey === keyQueue || busyKey === keyNow}
                            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-50"
                          >
                            Approve & Queue
                          </button>
                          <button
                            type="button"
                            onClick={() => onRelease(row, true)}
                            disabled={busyKey === keyQueue || busyKey === keyNow || !row.recipient_ready}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Release Now
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{row.paystack_transfer_code || row.paystack_reference || row.payout_reference || '-'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No records found for {ADMIN_ESCROW_TABS.find((item) => item.id === tab)?.label?.toLowerCase() || tab}.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

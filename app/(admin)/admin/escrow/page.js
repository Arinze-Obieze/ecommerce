'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function prettifyStatus(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function tone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'success':
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'processing':
    case 'queued':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'ready':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

const tabs = [
  { id: 'ready', label: 'Ready' },
  { id: 'held', label: 'Held' },
  { id: 'queued', label: 'Queued' },
  { id: 'processing', label: 'Processing' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
];

export default function AdminEscrowPage() {
  const [tab, setTab] = useState('ready');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busyKey, setBusyKey] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ status: tab });
      const res = await fetch(`/api/admin/escrow/releases?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load escrow data');
      setRows(Array.isArray(json.data?.rows) ? json.data.rows : []);
      setSummary(json.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = useMemo(
    () => [
      { label: 'Total Escrow Held', value: money(summary?.totalEscrowHeld) },
      { label: 'Ready For Release', value: money(summary?.readyForRelease) },
      { label: 'Queued', value: money(summary?.queuedAmount) },
      { label: 'Processing', value: money(summary?.processingAmount) },
      { label: 'Paid', value: money(summary?.paidAmount) },
      { label: 'Failed', value: money(summary?.failedAmount) },
      { label: 'Blocked Sellers', value: Number(summary?.sellersBlocked || 0).toLocaleString() },
      { label: 'Rows In View', value: rows.length.toLocaleString() },
    ],
    [rows.length, summary]
  );

  const release = async (row, releaseNow) => {
    const key = `${row.order_id}:${row.store_id}:${releaseNow ? 'now' : 'queue'}`;
    try {
      setBusyKey(key);
      setError('');
      const res = await fetch('/api/admin/escrow/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: row.order_id,
          store_id: row.store_id,
          release_now: Boolean(releaseNow),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Release action failed');
      await load();
    } catch (err) {
      setError(err.message || 'Release action failed');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Escrow Releases</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review held funds, release only after delivery confirmation, and keep transfer status separate from escrow approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#E8E4DC] bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === item.id ? 'bg-[#2E6417] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

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
                      <td className="py-2 pr-3 text-gray-600">
                        {new Date(row.released_at || row.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">
                        {row.kind === 'escrow' && row.ready_for_release ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => release(row, false)}
                              disabled={busyKey === keyQueue || busyKey === keyNow}
                              className="rounded-lg border border-[#2E6417] px-3 py-1.5 text-xs font-semibold text-[#2E6417] disabled:opacity-50"
                            >
                              Approve & Queue
                            </button>
                            <button
                              type="button"
                              onClick={() => release(row, true)}
                              disabled={busyKey === keyQueue || busyKey === keyNow || !row.recipient_ready}
                              className="rounded-lg bg-[#2E6417] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Release Now
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {row.paystack_transfer_code || row.paystack_reference || row.payout_reference || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No records found for {tabs.find((item) => item.id === tab)?.label?.toLowerCase() || tab}.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

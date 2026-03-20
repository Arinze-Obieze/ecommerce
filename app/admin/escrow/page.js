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

export default function AdminEscrowPage() {
  const [tab, setTab] = useState('queued');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [busyKey, setBusyKey] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ status: tab });
      const res = await fetch(`/api/admin/escrow/releases?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load escrow data');
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [rows]);

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
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Escrow Releases</h2>
        <p className="mt-1 text-sm text-gray-600">
          Release store funds only after delivery is confirmed. Use queue mode for back-office payout processing, or
          release now for immediate gateway transfer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">View</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setTab('queued')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === 'queued' ? 'bg-[#2E5C45] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Queued
            </button>
            <button
              type="button"
              onClick={() => setTab('released')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === 'released' ? 'bg-[#2E5C45] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Released
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Rows</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{rows.length}</p>
        </div>

        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total ({tab})</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{money(totalAmount)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
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
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const keyNow = `${row.order_id}:${row.store_id}:now`;
                  const keyQueue = `${row.order_id}:${row.store_id}:queue`;

                  return (
                    <tr key={row.id} className="border-b border-gray-50">
                      <td className="py-2 pr-3">
                        <div className="font-semibold text-gray-900">{row.stores?.name || row.store_id}</div>
                        <div className="text-xs text-gray-500">{row.store_id}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="font-semibold text-gray-900">{row.order_id}</div>
                        <div className="text-xs text-gray-500">{row.orders?.status || row.status}</div>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-gray-900">{money(row.amount)}</td>
                      <td className="py-2 pr-3 capitalize text-gray-700">{row.status}</td>
                      <td className="py-2 pr-3 text-gray-600">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-3">
                        {tab === 'queued' ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => release(row, false)}
                              disabled={busyKey === keyQueue || busyKey === keyNow}
                              className="rounded-lg border border-[#2E5C45] px-3 py-1.5 text-xs font-semibold text-[#2E5C45] disabled:opacity-50"
                            >
                              Queue Payout
                            </button>
                            <button
                              type="button"
                              onClick={() => release(row, true)}
                              disabled={busyKey === keyQueue || busyKey === keyNow}
                              className="rounded-lg bg-[#2E5C45] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Release Now
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {row.paystack_transfer_code || row.paystack_reference || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {tab === 'queued' ? 'No queued escrow holds found.' : 'No released payouts found.'}
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

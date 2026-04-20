'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardPageHeader from '@/components/store-console/dashboard/DashboardPageHeader';
import StatCard from '@/components/store-console/dashboard/StatCard';
import AlertBanner from '@/components/store-console/dashboard/AlertBanner';

const initialForm = {
  account_name: '',
  account_number: '',
  bank_code: '',
  bank_name: '',
};
const VIEW_OPTIONS = [
  { value: 'escrow', label: 'Escrow' },
  { value: 'payouts', label: 'Payouts' },
  { value: 'operations', label: 'Operations' },
];

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeAccountNumber(value) {
  return String(value || '').replace(/\D+/g, '').slice(0, 10);
}

function payoutStatusTone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'success':
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'processing':
    case 'queued':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'eligible':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function prettifyStatus(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// StatValue replaced by shared StatCard


export default function StorePayoutsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [opsData, setOpsData] = useState({ reconciliations: [], exceptions: [] });
  const [opsSaving, setOpsSaving] = useState(false);
  const [opsError, setOpsError] = useState('');
  const [bankQuery, setBankQuery] = useState('');
  const [bankMenuOpen, setBankMenuOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [activeView, setActiveView] = useState('escrow');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const lastResolvedKey = useRef('');
  const bankPickerRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [res, opsRes] = await Promise.all([
        fetch('/api/store/payouts', { cache: 'no-store' }),
        fetch('/api/store/payouts/ops', { cache: 'no-store' }),
      ]);
      const json = await res.json();
      const opsJson = await opsRes.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payouts');
      setData(json.data || null);
      if (opsRes.ok) {
        setOpsData(opsJson.data || { reconciliations: [], exceptions: [] });
      } else {
        setOpsError(opsJson.error || 'Failed to load payout operations');
      }
      const account = json.data?.payoutAccount;
      if (account) {
        const nextForm = {
          account_name: account.account_name || '',
          account_number: account.account_number || '',
          bank_code: account.bank_code || '',
          bank_name: account.bank_name || '',
        };
        setForm(nextForm);
        setBankQuery(nextForm.bank_name || '');
        if (nextForm.bank_code && nextForm.account_number && nextForm.account_name) {
          lastResolvedKey.current = `${nextForm.bank_code}:${nextForm.account_number}:${nextForm.account_name}`;
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!bankPickerRef.current?.contains(event.target)) {
        setBankMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const accountNumber = normalizeAccountNumber(form.account_number);
    if (!form.bank_code || accountNumber.length < 10) {
      setResolveError('');
      if (!accountNumber) {
        setForm((current) => (current.account_name ? { ...current, account_name: '' } : current));
      }
      return undefined;
    }

    const resolutionKey = `${form.bank_code}:${accountNumber}`;
    if (lastResolvedKey.current.startsWith(`${resolutionKey}:`)) {
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setResolving(true);
        setResolveError('');
        const res = await fetch('/api/store/payouts/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bank_code: form.bank_code,
            account_number: accountNumber,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to verify account');
        const resolvedName = json.data?.account_name || '';
        const resolvedBankName = json.data?.bank_name || '';
        setForm((current) => ({
          ...current,
          account_number: accountNumber,
          account_name: resolvedName,
          bank_name: resolvedBankName,
        }));
        lastResolvedKey.current = `${resolutionKey}:${resolvedName}`;
      } catch (err) {
        setForm((current) => ({ ...current, account_name: '' }));
        setResolveError(err.message || 'Failed to verify account');
      } finally {
        setResolving(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.bank_code, form.account_number]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const res = await fetch('/api/store/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_code: form.bank_code,
          bank_name: form.bank_name,
          account_number: normalizeAccountNumber(form.account_number),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save payout account');
      setNotice('Payout destination verified and ready for admin-approved escrow releases.');
      await load();
      setAccountModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save payout account');
    } finally {
      setSaving(false);
    }
  };

  const payoutAccount = data?.payoutAccount || null;
  const payouts = data?.payouts || [];
  const escrowItems = data?.escrowItems || [];
  const reconciliations = opsData?.reconciliations || [];
  const exceptions = opsData?.exceptions || [];
  const banks = data?.bankOptions || [];
  const summary = data?.summary || {};
  const filteredBanks = useMemo(() => {
    const query = bankQuery.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter((bank) => bank.name.toLowerCase().includes(query));
  }, [bankQuery, banks]);

  const cards = useMemo(
    () => [
      { label: 'Total In Escrow', value: money(summary.totalEscrowHeld) },
      { label: 'Available For Release', value: money(summary.availableForRelease) },
      { label: 'Queued Payouts', value: money(summary.payoutsQueued) },
      { label: 'Processing Payouts', value: money(summary.payoutsProcessing) },
      { label: 'Total Paid Out', value: money(summary.totalPaidOut) },
      { label: 'Failed Payouts', value: money(summary.failedPayouts) },
    ],
    [summary]
  );

  const accountStatusKey = payoutAccount?.recipient_status
    ? payoutAccount.recipient_status
    : payoutAccount?.recipient_code
      ? 'ready'
      : 'not_configured';

  const accountStatusLabel = payoutAccount?.recipient_status
    ? prettifyStatus(payoutAccount.recipient_status)
    : payoutAccount?.recipient_code
      ? 'Recipient Ready'
      : 'Not Configured';
  const hasOpenExceptions = exceptions.some((row) => row.status !== 'resolved');

  const createOpsItem = async (payload, successMessage) => {
    try {
      setOpsSaving(true);
      setOpsError('');
      setNotice('');
      const res = await fetch('/api/store/payouts/ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save payout operation');
      setNotice(successMessage);
      await load();
    } catch (err) {
      setOpsError(err.message || 'Failed to save payout operation');
    } finally {
      setOpsSaving(false);
    }
  };

  const updateOpsItem = async (payload, successMessage) => {
    try {
      setOpsSaving(true);
      setOpsError('');
      setNotice('');
      const res = await fetch('/api/store/payouts/ops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update payout operation');
      setNotice(successMessage);
      await load();
    } catch (err) {
      setOpsError(err.message || 'Failed to update payout operation');
    } finally {
      setOpsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Payouts & Escrow</h2>
        <p className="text-sm text-gray-500">
          Track held funds, monitor payout progress, and verify the bank account that receives admin-approved releases.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} loading={loading} />
        ))}
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">Payout readiness</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${payoutStatusTone(accountStatusKey)}`}>
                {accountStatusLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {payoutAccount?.recipient_code
                ? `${payoutAccount.bank_name || 'Bank'} ${payoutAccount.account_number ? `ending ${String(payoutAccount.account_number).slice(-4)}` : ''} is connected for admin-approved releases.`
                : 'Add a verified bank account before escrow can be released to this store.'}
            </p>
            {hasOpenExceptions ? (
              <p className="mt-2 text-sm font-semibold text-amber-700">Open payout exceptions need review.</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setAccountModalOpen(true)}
            className="rounded-xl bg-[#2E6417] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245213]"
          >
            {payoutAccount?.recipient_code ? 'Update payout account' : 'Add payout account'}
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-[#f7fbf8] p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bank</dt>
            <dd className="mt-1 break-words font-medium text-gray-900">{payoutAccount?.bank_name || form.bank_name || '-'}</dd>
          </div>
          <div className="rounded-xl bg-[#f7fbf8] p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</dt>
            <dd className="mt-1 font-medium text-gray-900">{payoutAccount?.account_number ? `****${String(payoutAccount.account_number).slice(-4)}` : '-'}</dd>
          </div>
          <div className="rounded-xl bg-[#f7fbf8] p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account name</dt>
            <dd className="mt-1 break-words font-medium text-gray-900">{payoutAccount?.account_name || form.account_name || '-'}</dd>
          </div>
          <div className="rounded-xl bg-[#f7fbf8] p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last verified</dt>
            <dd className="mt-1 break-words font-medium text-gray-900">
              {payoutAccount?.last_verified_at || payoutAccount?.verified_at
                ? new Date(payoutAccount.last_verified_at || payoutAccount.verified_at).toLocaleDateString()
                : '-'}
            </dd>
          </div>
        </dl>

        <AlertBanner type="error"  message={payoutAccount?.verification_error} />
        <AlertBanner type="error"  message={error} />
        <AlertBanner type="notice" message={notice} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#E8E4DC] bg-white p-2 shadow-sm">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setActiveView(option.value)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeView === option.value ? 'bg-[#2E6417] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {activeView === 'escrow' ? (
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Escrow Items</h3>
            <p className="text-sm text-gray-500">Held funds become releasable after delivery confirmation and admin approval.</p>
          </div>
          <div className="text-sm text-gray-500">
            {loading ? <span className="inline-block h-4 w-28 animate-pulse rounded bg-gray-200" aria-hidden="true" /> : `${summary.pendingEscrowItems || 0} active escrow items`}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading escrow records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Escrow</th>
                  <th className="py-2 pr-3">Fulfillment</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {escrowItems.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs">{row.order_id}</td>
                    <td className="py-2 pr-3 font-semibold text-gray-900">{money(row.amount)}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${payoutStatusTone(row.seller_view_status)}`}>
                        {prettifyStatus(row.seller_view_status)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{prettifyStatus(row.order?.fulfillment_status || 'pending')}</td>
                    <td className="py-2 pr-3 text-gray-600">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {escrowItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">No escrow items yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : null}

      {activeView === 'payouts' ? (
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold text-gray-900">Recent Payout Records</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading payout records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Updated</th>
                  <th className="py-2 pr-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs">{row.paystack_reference}</td>
                    <td className="py-2 pr-3">{money(row.amount)}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${payoutStatusTone(row.normalized_status)}`}>
                        {prettifyStatus(row.normalized_status)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-600">
                      {new Date(row.released_at || row.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-gray-600">
                      {row.failure_reason || row.paystack_transfer_code || row.metadata?.gateway_status || '-'}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">No payout records yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : null}

      {activeView === 'operations' ? (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Reconciliation Log</h3>
            <p className="text-sm text-gray-500">Capture mismatches between escrow expectations and payout records.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={opsSaving}
              onClick={() => createOpsItem({ type: 'reconciliation', notes: 'Manual reconciliation check logged from dashboard.' }, 'Reconciliation item logged.')}
              className="rounded-xl border border-[#2E6417] px-4 py-2 text-sm font-semibold text-[#2E6417] disabled:opacity-50"
            >
              Log reconciliation item
            </button>
          </div>

          {opsError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{opsError}</div> : null}

          <div className="mt-4 space-y-3">
            {reconciliations.map((row) => (
              <div key={row.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{row.notes}</p>
                    <p className="text-xs text-gray-500">{new Date(row.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${payoutStatusTone(row.status)}`}>
                      {prettifyStatus(row.status)}
                    </span>
                    {row.status !== 'resolved' ? (
                      <button
                        type="button"
                        disabled={opsSaving}
                        onClick={() => updateOpsItem({ type: 'reconciliation', id: row.id, status: 'resolved', notes: row.notes }, 'Reconciliation item resolved.')}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {reconciliations.length === 0 ? <p className="text-sm text-gray-500">No reconciliation items yet.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Payout Exceptions</h3>
            <p className="text-sm text-gray-500">Track failures, delays, and payout exceptions without leaving the store console.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={opsSaving}
              onClick={() => createOpsItem({ type: 'exception', category: 'manual_review', summary: 'Manual review requested from dashboard.', details: 'Follow up on payout timing and gateway confirmation.' }, 'Payout exception logged.')}
              className="rounded-xl bg-[#2E6417] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245213] disabled:opacity-50"
            >
              Log payout exception
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {exceptions.map((row) => (
              <div key={row.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{row.summary}</p>
                    <p className="text-sm text-gray-600">{prettifyStatus(row.category)}</p>
                    {row.details ? <p className="mt-1 text-xs text-gray-500">{row.details}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${payoutStatusTone(row.status)}`}>
                      {prettifyStatus(row.status)}
                    </span>
                    {row.status !== 'resolved' ? (
                      <button
                        type="button"
                        disabled={opsSaving}
                        onClick={() => updateOpsItem({ type: 'exception', id: row.id, status: 'resolved', details: row.details }, 'Payout exception resolved.')}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {exceptions.length === 0 ? <p className="text-sm text-gray-500">No payout exceptions yet.</p> : null}
          </div>
        </div>
      </div>
      ) : null}

      {accountModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-[#E8E4DC] bg-white p-5 shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {payoutAccount?.recipient_code ? 'Update payout account' : 'Add payout account'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the destination account. We verify the account name before saving the payout recipient.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountModalOpen(false);
                  setBankMenuOpen(false);
                  setResolveError('');
                }}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={onSave} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Bank</span>
                <div className="relative" ref={bankPickerRef}>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Search bank"
                    value={bankQuery}
                    onFocus={() => setBankMenuOpen(true)}
                    onChange={(e) => {
                      setBankQuery(e.target.value);
                      setBankMenuOpen(true);
                      if (form.bank_code) {
                        lastResolvedKey.current = '';
                        setForm((current) => ({
                          ...current,
                          bank_code: '',
                          bank_name: '',
                          account_name: '',
                        }));
                      }
                      setResolveError('');
                    }}
                    required
                  />
                  <input type="hidden" name="bank_code" value={form.bank_code} />
                  {bankMenuOpen ? (
                    <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank, index) => (
                          <button
                            key={`${bank.code}:${bank.name}:${index}`}
                            type="button"
                            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                              bank.code === form.bank_code ? 'bg-[#EDF5E6] text-[#2E6417]' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              lastResolvedKey.current = '';
                              setForm((current) => ({
                                ...current,
                                bank_code: bank.code,
                                bank_name: bank.name,
                                account_name: '',
                              }));
                              setBankQuery(bank.name);
                              setBankMenuOpen(false);
                              setResolveError('');
                            }}
                          >
                            {bank.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No banks match your search.</div>
                      )}
                    </div>
                  ) : null}
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Account number</span>
                <input
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="0123456789"
                  inputMode="numeric"
                  value={form.account_number}
                  onChange={(e) => {
                    lastResolvedKey.current = '';
                    setForm((current) => ({
                      ...current,
                      account_number: normalizeAccountNumber(e.target.value),
                      account_name: '',
                    }));
                    setResolveError('');
                  }}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
                <span className="font-medium">Resolved account name</span>
                <input
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  placeholder={resolving ? 'Verifying account...' : 'Account name will appear automatically'}
                  value={form.account_name}
                  readOnly
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving || resolving || !form.bank_code || normalizeAccountNumber(form.account_number).length < 10 || !form.account_name}
                  className="rounded-xl bg-[#2E6417] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245213] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save payout account'}
                </button>
                {resolving ? <span className="text-sm text-gray-500">Verifying account...</span> : null}
                {resolveError ? <span className="text-sm text-red-600">{resolveError}</span> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const initialForm = {
  account_name: '',
  account_number: '',
  bank_code: '',
  bank_name: '',
};

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

export default function StorePayoutsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [bankQuery, setBankQuery] = useState('');
  const [bankMenuOpen, setBankMenuOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const lastResolvedKey = useRef('');
  const bankPickerRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/store/payouts', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payouts');
      setData(json.data || null);
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
    } catch (err) {
      setError(err.message || 'Failed to save payout account');
    } finally {
      setSaving(false);
    }
  };

  const payoutAccount = data?.payoutAccount || null;
  const payouts = data?.payouts || [];
  const escrowItems = data?.escrowItems || [];
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Payouts & Escrow</h2>
        <p className="text-sm text-gray-500">
          Track held funds, monitor payout progress, and verify the bank account that receives admin-approved releases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#2E5C45]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Payout Account</h3>
            <p className="text-sm text-gray-500">
              Sellers only enter bank and account number. We fetch the account name automatically and create the Paystack transfer recipient for future releases.
            </p>
          </div>

          <form onSubmit={onSave} className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                            bank.code === form.bank_code ? 'bg-[#f3f8f5] text-[#2E5C45]' : 'hover:bg-gray-50'
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

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                disabled={saving || resolving || !form.bank_code || normalizeAccountNumber(form.account_number).length < 10 || !form.account_name}
                className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Payout Account'}
              </button>
              {resolving ? <span className="text-sm text-gray-500">Verifying account with Paystack...</span> : null}
              {resolveError ? <span className="text-sm text-red-600">{resolveError}</span> : null}
            </div>
          </form>

          {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {notice ? <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recipient Status</h3>
              <p className="text-sm text-gray-500">Admin can only release escrow to a verified active payout destination.</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${payoutStatusTone(accountStatusKey)}`}>
              {accountStatusLabel}
            </span>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500">Bank</dt>
              <dd className="font-medium text-gray-900">{payoutAccount?.bank_name || form.bank_name || '-'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500">Account number</dt>
              <dd className="font-medium text-gray-900">
                {payoutAccount?.account_number ? `****${String(payoutAccount.account_number).slice(-4)}` : '-'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500">Account name</dt>
              <dd className="font-medium text-gray-900">{payoutAccount?.account_name || form.account_name || '-'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500">Recipient code</dt>
              <dd className="font-mono text-xs text-gray-700">{payoutAccount?.recipient_code || '-'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500">Last verified</dt>
              <dd className="font-medium text-gray-900">
                {payoutAccount?.last_verified_at || payoutAccount?.verified_at
                  ? new Date(payoutAccount.last_verified_at || payoutAccount.verified_at).toLocaleString()
                  : '-'}
              </dd>
            </div>
          </dl>

          {payoutAccount?.verification_error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {payoutAccount.verification_error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Escrow Items</h3>
            <p className="text-sm text-gray-500">Held funds become releasable after delivery confirmation and admin approval.</p>
          </div>
          <div className="text-sm text-gray-500">{summary.pendingEscrowItems || 0} active escrow items</div>
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

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
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
    </div>
  );
}

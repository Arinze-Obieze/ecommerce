'use client';

import { useEffect, useState } from 'react';

const initialForm = {
  account_name: '',
  account_number: '',
  bank_code: '',
  bank_name: '',
};

export default function StorePayoutsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(initialForm);

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
        setForm((prev) => ({
          ...prev,
          account_name: account.account_name || '',
          account_number: account.account_number || '',
          bank_code: account.bank_code || '',
          bank_name: account.bank_name || '',
        }));
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

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const res = await fetch('/api/store/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save payout account');
      setNotice('Payout account saved. Recipient verification can be completed by admin/ops.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to save payout account');
    } finally {
      setSaving(false);
    }
  };

  const payouts = data?.payouts || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Payouts & Escrow</h2>
        <p className="text-sm text-gray-500">Configure payout account and monitor escrow release progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Escrow Held</p>
          <p className="mt-1 text-2xl font-bold text-[#2E5C45]">₦{Number(data?.summary?.escrowHeld || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Escrow Released</p>
          <p className="mt-1 text-2xl font-bold text-[#2E5C45]">₦{Number(data?.summary?.escrowReleased || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold text-gray-900">Payout Account</h3>
        <form onSubmit={onSave} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Account name" value={form.account_name} onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))} />
          <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Account number" value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))} required />
          <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Bank code" value={form.bank_code} onChange={(e) => setForm((f) => ({ ...f, bank_code: e.target.value }))} required />
          <input className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Bank name" value={form.bank_name} onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))} />
          <button disabled={saving} className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Payout Account'}
          </button>
        </form>
        {error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}
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
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs">{row.paystack_reference}</td>
                    <td className="py-2 pr-3">₦{Number(row.amount || 0).toLocaleString()}</td>
                    <td className="py-2 pr-3 capitalize">{row.status}</td>
                    <td className="py-2 pr-3">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">No payout records yet.</td>
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

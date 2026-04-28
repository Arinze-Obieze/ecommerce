'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  initialPayoutForm,
  money,
  normalizeAccountNumber,
  prettifyStatus,
} from '@/features/store-console/payouts/payouts.utils';

export default function useStorePayouts() {
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
  const [form, setForm] = useState(initialPayoutForm);
  const [activeView, setActiveView] = useState('escrow');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const lastResolvedKey = useRef('');
  const bankPickerRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [response, opsResponse] = await Promise.all([
        fetch('/api/store/payouts', { cache: 'no-store' }),
        fetch('/api/store/payouts/ops', { cache: 'no-store' }),
      ]);
      const json = await response.json();
      const opsJson = await opsResponse.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load payouts');

      setData(json.data || null);
      if (opsResponse.ok) {
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
    void load();
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
        const response = await fetch('/api/store/payouts/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bank_code: form.bank_code,
            account_number: accountNumber,
          }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Failed to verify account');
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

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const response = await fetch('/api/store/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_code: form.bank_code,
          bank_name: form.bank_name,
          account_number: normalizeAccountNumber(form.account_number),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to save payout account');
      setNotice('Payout destination verified and ready for admin-approved escrow releases.');
      await load();
      setAccountModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save payout account');
    } finally {
      setSaving(false);
    }
  };

  const createOpsItem = async (payload, successMessage) => {
    try {
      setOpsSaving(true);
      setOpsError('');
      setNotice('');
      const response = await fetch('/api/store/payouts/ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to save payout operation');
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
      const response = await fetch('/api/store/payouts/ops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update payout operation');
      setNotice(successMessage);
      await load();
    } catch (err) {
      setOpsError(err.message || 'Failed to update payout operation');
    } finally {
      setOpsSaving(false);
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

  return {
    loading,
    saving,
    resolving,
    error,
    notice,
    resolveError,
    opsSaving,
    opsError,
    bankQuery,
    setBankQuery,
    bankMenuOpen,
    setBankMenuOpen,
    form,
    setForm,
    activeView,
    setActiveView,
    accountModalOpen,
    setAccountModalOpen,
    bankPickerRef,
    lastResolvedKey,
    onSave,
    createOpsItem,
    updateOpsItem,
    payoutAccount,
    payouts,
    escrowItems,
    reconciliations,
    exceptions,
    filteredBanks,
    cards,
    summary,
    accountStatusKey,
    accountStatusLabel,
    hasOpenExceptions,
  };
}

'use client';

import {
  EscrowItemsTable,
  PayoutAccountModal,
  PayoutOperationsPanels,
  PayoutReadinessCard,
  PayoutRecordsTable,
  PayoutStats,
  PayoutViewTabs,
} from '@/features/store-console/payouts/StorePayoutSections';
import useStorePayouts from '@/features/store-console/payouts/useStorePayouts';

export default function StorePayoutsPage() {
  const {
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
  } = useStorePayouts();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Payouts & Escrow</h2>
        <p className="text-sm text-gray-500">
          Track held funds, monitor payout progress, and verify the bank account that receives admin-approved releases.
        </p>
      </div>

      <PayoutStats cards={cards} loading={loading} />

      <PayoutReadinessCard
        payoutAccount={payoutAccount}
        form={form}
        accountStatusKey={accountStatusKey}
        accountStatusLabel={accountStatusLabel}
        hasOpenExceptions={hasOpenExceptions}
        error={error}
        notice={notice}
        onManageAccount={() => setAccountModalOpen(true)}
      />

      <PayoutViewTabs activeView={activeView} onViewChange={setActiveView} />

      {activeView === 'escrow' ? (
        <EscrowItemsTable loading={loading} escrowItems={escrowItems} summary={summary} />
      ) : null}

      {activeView === 'payouts' ? (
        <PayoutRecordsTable loading={loading} payouts={payouts} />
      ) : null}

      {activeView === 'operations' ? (
        <PayoutOperationsPanels
          reconciliations={reconciliations}
          exceptions={exceptions}
          opsSaving={opsSaving}
          opsError={opsError}
          onCreateReconciliation={() => createOpsItem({ type: 'reconciliation', notes: 'Manual reconciliation check logged from dashboard.' }, 'Reconciliation item logged.')}
          onResolveReconciliation={(row) => updateOpsItem({ type: 'reconciliation', id: row.id, status: 'resolved', notes: row.notes }, 'Reconciliation item resolved.')}
          onCreateException={() => createOpsItem({ type: 'exception', category: 'manual_review', summary: 'Manual review requested from dashboard.', details: 'Follow up on payout timing and gateway confirmation.' }, 'Payout exception logged.')}
          onResolveException={(row) => updateOpsItem({ type: 'exception', id: row.id, status: 'resolved', details: row.details }, 'Payout exception resolved.')}
        />
      ) : null}

      <PayoutAccountModal
        payoutAccount={payoutAccount}
        accountModalOpen={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setBankMenuOpen(false);
        }}
        onSave={onSave}
        saving={saving}
        resolving={resolving}
        resolveError={resolveError}
        form={form}
        setForm={setForm}
        bankQuery={bankQuery}
        setBankQuery={setBankQuery}
        bankMenuOpen={bankMenuOpen}
        setBankMenuOpen={setBankMenuOpen}
        filteredBanks={filteredBanks}
        bankPickerRef={bankPickerRef}
        lastResolvedKey={lastResolvedKey}
      />
    </div>
  );
}

'use client';

import {
  AssignOwnerModal,
  CreateStorePanel,
  StoreGovernancePanel,
} from '@/features/admin/stores/AdminStoresSections';
import useAdminStores from '@/features/admin/stores/useAdminStores';

export default function AdminStoresPage() {
  const {
    items,
    loading,
    error,
    notice,
    noticeType,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    limit,
    setLimit,
    meta,
    isCreateOpen,
    setIsCreateOpen,
    assignModal,
    assignMode,
    setAssignMode,
    assignValue,
    setAssignValue,
    assigning,
    assignError,
    deletingId,
    loadStores,
    updateStoreStatus,
    deleteStore,
    openAssignOwnerModal,
    closeAssignOwnerModal,
    submitAssignOwner,
    setNotice,
    setNoticeType,
    setError,
    setAssignError,
  } = useAdminStores();

  return (
    <div className="space-y-6">
      <AssignOwnerModal
        assignModal={assignModal}
        assignMode={assignMode}
        setAssignMode={setAssignMode}
        assignValue={assignValue}
        setAssignValue={setAssignValue}
        assignError={assignError}
        assigning={assigning}
        onClose={closeAssignOwnerModal}
        onSubmit={submitAssignOwner}
        clearAssignError={setAssignError}
      />

      <CreateStorePanel
        isOpen={isCreateOpen}
        onToggle={() => setIsCreateOpen((current) => !current)}
        onSuccess={(message, type) => {
          setNotice(message);
          setNoticeType(type);
          void loadStores(1, limit);
        }}
        onError={(message) => {
          if (message) setError(message);
        }}
      />

      <StoreGovernancePanel
        loading={loading}
        error={error}
        notice={notice}
        noticeType={noticeType}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onApplyFilters={() => {
          setPage(1);
          void loadStores(1, limit);
        }}
        items={items}
        onUpdateStatus={updateStoreStatus}
        onAssignOwner={openAssignOwnerModal}
        onDeleteStore={deleteStore}
        deletingId={deletingId}
        meta={meta}
        page={page}
        limit={limit}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
          void loadStores(1, nextLimit);
        }}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          void loadStores(nextPage, limit);
        }}
      />
    </div>
  );
}

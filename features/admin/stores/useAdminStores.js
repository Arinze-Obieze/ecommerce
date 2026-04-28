'use client';

import { useEffect, useState } from 'react';

export default function useAdminStores() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, storeId: '', storeName: '' });
  const [assignMode, setAssignMode] = useState('uuid');
  const [assignValue, setAssignValue] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadStores = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));

      const response = await fetch(`/api/admin/stores?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load stores');

      setItems(json.data || []);
      setMeta(json.meta || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 });
      setPage(json.meta?.page || nextPage);
      setLimit(json.meta?.limit || nextLimit);
    } catch (err) {
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores(1, limit);
  }, []);

  const patchStore = async (id, updates) => {
    const response = await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Failed to update store');
    return json.data;
  };

  const updateStoreStatus = async (storeId, nextStatus) => {
    try {
      setError('');
      await patchStore(storeId, { status: nextStatus });
      await loadStores(page, limit);
    } catch (err) {
      setError(err.message || 'Failed to update store');
    }
  };

  const deleteStore = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the store "${name}"? This will also delete all associated products and CANNOT be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setNotice('');
      const response = await fetch(`/api/admin/stores/${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to delete store');
      setNotice(`Store "${name}" and its products were successfully deleted.`);
      setNoticeType('success');
      await loadStores(page, limit);
    } catch (err) {
      setError(err.message || 'Failed to delete store');
    } finally {
      setDeletingId(null);
    }
  };

  const openAssignOwnerModal = (store) => {
    setAssignModal({ open: true, storeId: store.id, storeName: store.name });
    setAssignMode('uuid');
    setAssignValue('');
    setAssignError('');
    setNotice('');
  };

  const closeAssignOwnerModal = () => {
    setAssignModal({ open: false, storeId: '', storeName: '' });
    setAssignMode('uuid');
    setAssignValue('');
    setAssignError('');
  };

  const submitAssignOwner = async (event) => {
    event.preventDefault();
    const value = assignValue.trim();
    if (!value) {
      setAssignError(assignMode === 'uuid' ? 'Owner UUID is required' : 'Owner email is required');
      return;
    }

    const payload = assignMode === 'uuid' ? { user_id: value } : { email: value.toLowerCase() };

    try {
      setAssigning(true);
      setAssignError('');
      setError('');
      setNotice('');

      const response = await fetch(`/api/admin/stores/${assignModal.storeId}/assign-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to assign owner');

      const accountCreated = Boolean(json?.data?.account_created);
      const emailStatus = json?.data?.email_status || 'skipped';
      const ownerRole = json?.data?.owner_role || 'owner';
      const ownerEmail = json?.data?.owner_email;

      let nextNotice = accountCreated
        ? `Owner assigned with role "${ownerRole}". New account created${ownerEmail ? ` for ${ownerEmail}` : ''}.`
        : `Owner assigned with role "${ownerRole}" successfully.`;
      let nextNoticeType = 'success';

      if (emailStatus === 'sent' && ownerEmail) nextNotice += ` Email sent to ${ownerEmail}.`;
      if (emailStatus === 'failed') {
        nextNotice += ` Email failed${json?.data?.email_error ? `: ${json.data.email_error}` : '.'}`;
        nextNoticeType = 'warning';
      }

      closeAssignOwnerModal();
      setNotice(nextNotice);
      setNoticeType(nextNoticeType);
      await loadStores(page, limit);
    } catch (err) {
      setAssignError(err.message || 'Failed to assign owner');
    } finally {
      setAssigning(false);
    }
  };

  return {
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
  };
}

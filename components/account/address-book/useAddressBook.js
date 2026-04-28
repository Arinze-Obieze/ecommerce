'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/toast/ToastContext';
import { EMPTY_ADDRESS_FORM } from '@/components/account/address-book/addressBook.constants';

export default function useAddressBook() {
  const { success, error: showError } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);

  const editingAddress = useMemo(
    () => addresses.find((address) => address.id === editingId) || null,
    [addresses, editingId]
  );

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/addresses', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Could not load addresses');
      setAddresses(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      showError(err.message || 'Could not load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_ADDRESS_FORM, isDefault: addresses.length === 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setEditingId(address.id);
    setForm({
      type: address.type || 'Address',
      address: address.address || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Nigeria',
      phone: address.phone || '',
      isDefault: Boolean(address.isDefault),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_ADDRESS_FORM);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to save address');
      success(editingId ? 'Address updated' : 'Address added');
      closeModal();
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to remove address');
      success('Address removed');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to remove address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (address) => {
    if (address.isDefault) return;
    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to set default');
      success('Default address updated');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to set default address');
    }
  };

  return {
    addresses,
    loading,
    saving,
    deletingId,
    isModalOpen,
    editingAddress,
    form,
    setIsModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    handleChange,
    handleSave,
    handleDelete,
    handleSetDefault,
  };
}

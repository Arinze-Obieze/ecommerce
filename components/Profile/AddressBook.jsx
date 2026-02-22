"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiMapPin, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

const EMPTY_FORM = {
  type: 'Home',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Nigeria',
  phone: '',
  isDefault: false,
};

export default function AddressBook() {
  const { success, error: showError } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const editingAddress = useMemo(
    () => addresses.find((item) => item.id === editingId) || null,
    [addresses, editingId]
  );

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/addresses', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Could not load addresses');
      }
      setAddresses(Array.isArray(json.data) ? json.data : []);
    } catch (fetchError) {
      showError(fetchError.message || 'Could not load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
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
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save address');
      }

      success(editingId ? 'Address updated' : 'Address added');
      closeModal();
      await fetchAddresses();
    } catch (saveError) {
      showError(saveError.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to remove address');
      }

      success('Address removed');
      await fetchAddresses();
    } catch (deleteError) {
      showError(deleteError.message || 'Failed to remove address');
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
      if (!response.ok) {
        throw new Error(json.error || 'Failed to set default address');
      }

      success('Default address updated');
      await fetchAddresses();
    } catch (setDefaultError) {
      showError(setDefaultError.message || 'Failed to set default address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#2E5C45] text-white rounded-lg font-medium hover:bg-[#254a38] transition-colors text-sm"
        >
          <FiPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="h-48 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-gray-600">No saved addresses yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-5 py-2 bg-[#2E5C45] text-white rounded-lg text-sm font-medium hover:bg-[#254a38]"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Default
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{addr.type}</h3>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-6">
                <p>{addr.address}</p>
                {addr.addressLine2 ? <p>{addr.addressLine2}</p> : null}
                <p>{addr.city}, {addr.state}</p>
                <p>{addr.country}</p>
                <p className="pt-2 text-gray-900 font-medium">{addr.phone}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="px-3 py-2 text-xs font-medium text-[#2E5C45] hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Make Default
                  </button>
                )}
                <button
                  onClick={() => openEditModal(addr)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-[#2E5C45] hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FiTrash2 className="w-4 h-4" /> {deletingId === addr.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    placeholder="Home"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5C45]"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-7">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-[#2E5C45] focus:ring-[#2E5C45]"
                  />
                  Set as default address
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium bg-[#2E5C45] text-white rounded-lg hover:bg-[#254a38] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

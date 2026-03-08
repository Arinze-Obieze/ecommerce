"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiMapPin, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  green:       '#00B86B',
  greenDark:   '#0F7A4F',
  greenTint:   '#EDFAF3',
  greenBorder: '#A8DFC4',
  white:       '#FFFFFF',
  pageBg:      '#F9FAFB',
  charcoal:    '#111111',
  medGray:     '#666666',
  mutedText:   '#999999',
  border:      '#E8E8E8',
  softGray:    '#F5F5F5',
};

const EMPTY_FORM = {
  type: 'Home', address: '', addressLine2: '',
  city: '', state: '', postalCode: '',
  country: 'Nigeria', phone: '', isDefault: false,
};

// ─── FIELD ────────────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: THEME.medGray, marginBottom: 6, letterSpacing: '0.02em' }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  color: THEME.charcoal,
  background: THEME.white,
  border: `1.5px solid ${THEME.border}`,
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

// ─── ADDRESS CARD ─────────────────────────────────────────────────────────────
const AddressCard = ({ addr, onEdit, onDelete, onSetDefault, deletingId }) => {
  const [hov, setHov] = useState(false);
  const isDeleting = deletingId === addr.id;

  return (
    <div
      style={{
        background: THEME.white,
        border: `1.5px solid ${hov ? THEME.greenBorder : THEME.border}`,
        borderRadius: 18,
        padding: '22px 24px',
        position: 'relative',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Default badge */}
      {addr.isDefault && (
        <span
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: THEME.greenTint,
            color: THEME.green,
            border: `1px solid ${THEME.greenBorder}`,
          }}
        >
          <FiCheck size={9} /> Default
        </span>
      )}

      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: THEME.greenTint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FiMapPin size={17} style={{ color: THEME.green }} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.01em' }}>
          {addr.type}
        </h3>
      </div>

      {/* Address lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 20 }}>
        {[
          addr.address,
          addr.addressLine2,
          `${addr.city}, ${addr.state}`,
          addr.country,
        ].filter(Boolean).map((line, i) => (
          <p key={i} style={{ fontSize: 13, color: THEME.medGray, margin: 0, lineHeight: 1.5 }}>{line}</p>
        ))}
        {addr.phone && (
          <p style={{ fontSize: 13, fontWeight: 600, color: THEME.charcoal, margin: '6px 0 0' }}>{addr.phone}</p>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          paddingTop: 16,
          borderTop: `1px solid ${THEME.border}`,
          flexWrap: 'wrap',
        }}
      >
        {!addr.isDefault && (
          <ActionBtn onClick={() => onSetDefault(addr)} color={THEME.green} hoverBg={THEME.greenTint}>
            Make Default
          </ActionBtn>
        )}
        <ActionBtn onClick={() => onEdit(addr)} color={THEME.medGray} hoverBg={THEME.softGray} icon={<FiEdit2 size={12} />}>
          Edit
        </ActionBtn>
        <ActionBtn
          onClick={() => onDelete(addr.id)}
          disabled={isDeleting}
          color="#DC2626"
          hoverBg="#FEF2F2"
          icon={<FiTrash2 size={12} />}
        >
          {isDeleting ? 'Removing…' : 'Remove'}
        </ActionBtn>
      </div>
    </div>
  );
};

const ActionBtn = ({ children, onClick, disabled, color, hoverBg, icon }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 12px',
        borderRadius: 8,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12,
        fontWeight: 600,
        color: hov ? color : THEME.medGray,
        background: hov ? hoverBg : 'transparent',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {icon}{children}
    </button>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AddressBook() {
  const { success, error: showError } = useToast();
  const [addresses, setAddresses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [addHov, setAddHov]         = useState(false);
  const [saveHov, setSaveHov]       = useState(false);

  const editingAddress = useMemo(
    () => addresses.find((a) => a.id === editingId) || null,
    [addresses, editingId]
  );

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/account/addresses', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load addresses');
      setAddresses(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      showError(e.message || 'Could not load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setForm({
      type: addr.type || 'Address', address: addr.address || '',
      addressLine2: addr.addressLine2 || '', city: addr.city || '',
      state: addr.state || '', postalCode: addr.postalCode || '',
      country: addr.country || 'Nigeria', phone: addr.phone || '',
      isDefault: Boolean(addr.isDefault),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url    = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json   = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save address');
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
      const res  = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove address');
      success('Address removed');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to remove address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    if (addr.isDefault) return;
    try {
      const res  = await fetch(`/api/account/addresses/${addr.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to set default');
      success('Default address updated');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to set default address');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: THEME.mutedText, margin: 0, marginBottom: 4 }}>
            My Account
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.025em' }}>
            Address Book
          </h2>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          onMouseEnter={() => setAddHov(true)}
          onMouseLeave={() => setAddHov(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            color: THEME.white,
            background: addHov ? THEME.greenDark : THEME.green,
            transition: 'background 0.2s',
          }}
        >
          <FiPlus size={15} /> Add Address
        </button>
      </div>

      {/* ── Loading skeletons ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="grid-cols-1 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: 200, borderRadius: 18, background: THEME.softGray, border: `1px solid ${THEME.border}` }} />
          ))}
        </div>

      /* ── Empty state ── */
      ) : addresses.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            textAlign: 'center',
            background: THEME.white,
            border: `1.5px dashed ${THEME.border}`,
            borderRadius: 20,
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: THEME.greenTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <FiMapPin size={22} style={{ color: THEME.green }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.charcoal, margin: '0 0 6px', letterSpacing: '-0.02em' }}>No saved addresses</h3>
          <p style={{ fontSize: 13, color: THEME.mutedText, margin: '0 0 24px' }}>Add a delivery address to speed up checkout.</p>
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              color: THEME.white, background: THEME.green,
            }}
          >
            <FiPlus size={14} /> Add your first address
          </button>
        </div>

      /* ── Cards grid ── */
      ) : (
        <div style={{ display: 'grid', gap: 16 }} className="grid-cols-1 md:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              width: '100%', maxWidth: 560,
              background: THEME.white,
              borderRadius: 20,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: `1px solid ${THEME.border}`,
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.charcoal, margin: 0, letterSpacing: '-0.02em' }}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: THEME.softGray, color: THEME.medGray, cursor: 'pointer',
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="grid-cols-1 md:grid-cols-2">
                <Field label="Label">
                  <input name="type" value={form.type} onChange={handleChange} placeholder="Home" style={inputStyle} />
                </Field>
                <Field label="Phone *">
                  <input name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
                </Field>
              </div>

              <Field label="Address Line 1 *">
                <input name="address" value={form.address} onChange={handleChange} required style={inputStyle} />
              </Field>

              <Field label="Address Line 2">
                <input name="addressLine2" value={form.addressLine2} onChange={handleChange} style={inputStyle} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }} className="grid-cols-1 md:grid-cols-3">
                <Field label="City *">
                  <input name="city" value={form.city} onChange={handleChange} required style={inputStyle} />
                </Field>
                <Field label="State *">
                  <input name="state" value={form.state} onChange={handleChange} required style={inputStyle} />
                </Field>
                <Field label="Postal Code">
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }} className="grid-cols-1 md:grid-cols-2">
                <Field label="Country">
                  <input name="country" value={form.country} onChange={handleChange} style={inputStyle} />
                </Field>
                <label
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13, fontWeight: 500, color: THEME.medGray,
                    cursor: 'pointer', paddingBottom: 2,
                  }}
                >
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                    style={{ accentColor: THEME.green, width: 16, height: 16 }}
                  />
                  Set as default address
                </label>
              </div>

              {/* Modal footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: `1px solid ${THEME.border}`, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${THEME.border}`, background: THEME.white,
                    color: THEME.medGray, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  onMouseEnter={() => setSaveHov(true)}
                  onMouseLeave={() => setSaveHov(false)}
                  style={{
                    padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    color: THEME.white,
                    background: saving ? THEME.mutedText : saveHov ? THEME.greenDark : THEME.green,
                    opacity: saving ? 0.7 : 1,
                    transition: 'background 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
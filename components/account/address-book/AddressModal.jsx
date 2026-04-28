'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Field from '@/components/account/address-book/Field';

export default function AddressModal({
  open,
  saving,
  editingAddress,
  form,
  handleChange,
  handleSave,
  closeModal,
}) {
  const [saveHovered, setSaveHovered] = useState(false);

  if (!open) return null;

  return (
    <div
      className="zova-account-overlay"
      style={{ backdropFilter: 'blur(3px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          overflow: 'hidden',
          border: '1px solid var(--zova-border)',
          borderRadius: 20,
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--zova-border)',
          }}
        >
          <h3 style={{ margin: 0, color: 'var(--zova-text-strong)', fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: 8,
              background: 'var(--zova-surface-alt)',
              color: 'var(--zova-text-body)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '22px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="grid-cols-1 md:grid-cols-2">
            <Field label="Label">
              <input name="type" value={form.type} onChange={handleChange} placeholder="Home" className="zova-account-field" />
            </Field>
            <Field label="Phone *">
              <input name="phone" value={form.phone} onChange={handleChange} required className="zova-account-field" />
            </Field>
          </div>

          <Field label="Address Line 1 *">
            <input name="address" value={form.address} onChange={handleChange} required className="zova-account-field" />
          </Field>

          <Field label="Address Line 2">
            <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className="zova-account-field" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }} className="grid-cols-1 md:grid-cols-3">
            <Field label="City *">
              <input name="city" value={form.city} onChange={handleChange} required className="zova-account-field" />
            </Field>
            <Field label="State *">
              <input name="state" value={form.state} onChange={handleChange} required className="zova-account-field" />
            </Field>
            <Field label="Postal Code">
              <input name="postalCode" value={form.postalCode} onChange={handleChange} className="zova-account-field" />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }} className="grid-cols-1 md:grid-cols-2">
            <Field label="Country">
              <input name="country" value={form.country} onChange={handleChange} className="zova-account-field" />
            </Field>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingBottom: 2,
                color: 'var(--zova-text-body)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                style={{ width: 16, height: 16, accentColor: 'var(--zova-primary-action)' }}
              />
              Set as default address
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, marginTop: 4, borderTop: '1px solid var(--zova-border)' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                border: '1.5px solid var(--zova-border)',
                borderRadius: 10,
                background: 'white',
                color: 'var(--zova-text-body)',
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              onMouseEnter={() => setSaveHovered(true)}
              onMouseLeave={() => setSaveHovered(false)}
              style={{
                border: 'none',
                borderRadius: 10,
                background: saving ? 'var(--zova-text-muted)' : saveHovered ? 'var(--zova-primary-action-hover)' : 'var(--zova-primary-action)',
                color: 'white',
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
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
  );
}

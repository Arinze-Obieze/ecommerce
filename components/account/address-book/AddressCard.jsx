'use client';

import { useState } from 'react';
import { FiCheck, FiEdit2, FiMapPin, FiTrash2 } from 'react-icons/fi';

function ActionButton({ children, onClick, disabled, color, hoverBg, icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: 'none',
        borderRadius: 8,
        background: hovered ? hoverBg : 'transparent',
        color: hovered ? color : 'var(--zova-text-body)',
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault, deletingId }) {
  const [hovered, setHovered] = useState(false);
  const isDeleting = deletingId === address.id;

  return (
    <div
      className="p-5 sm:p-6"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        border: `1.5px solid ${hovered ? '#B8D4A0' : 'var(--zova-border)'}`,
        borderRadius: 18,
        background: 'white',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {address.isDefault ? (
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid #B8D4A0',
            borderRadius: 999,
            background: 'var(--zova-green-soft)',
            color: 'var(--zova-primary-action)',
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <FiCheck size={9} />
          Default
        </span>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingRight: address.isDefault ? 72 : 0, minWidth: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 10,
            background: 'var(--zova-green-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiMapPin size={17} style={{ color: 'var(--zova-primary-action)' }} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--zova-text-strong)', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
          {address.type}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 20, minWidth: 0 }}>
        {[address.address, address.addressLine2, `${address.city}, ${address.state}`, address.country]
          .filter(Boolean)
          .map((line) => (
            <p key={line} style={{ margin: 0, color: 'var(--zova-text-body)', fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {line}
            </p>
          ))}
        {address.phone ? (
          <p style={{ margin: '6px 0 0', color: 'var(--zova-text-strong)', fontSize: 13, fontWeight: 600, overflowWrap: 'anywhere' }}>
            {address.phone}
          </p>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--zova-border)' }}>
        {!address.isDefault ? (
          <ActionButton onClick={() => onSetDefault(address)} color="var(--zova-primary-action)" hoverBg="var(--zova-green-soft)">
            Make Default
          </ActionButton>
        ) : null}
        <ActionButton
          onClick={() => onEdit(address)}
          color="var(--zova-text-body)"
          hoverBg="var(--zova-surface-alt)"
          icon={<FiEdit2 size={12} />}
        >
          Edit
        </ActionButton>
        <ActionButton
          onClick={() => onDelete(address.id)}
          disabled={isDeleting}
          color="#DC2626"
          hoverBg="#FEF2F2"
          icon={<FiTrash2 size={12} />}
        >
          {isDeleting ? 'Removing…' : 'Remove'}
        </ActionButton>
      </div>
    </div>
  );
}

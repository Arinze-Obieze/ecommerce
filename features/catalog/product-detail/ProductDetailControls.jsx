'use client';

import { FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
export { ColorSwatchSelector } from '@/features/catalog/product-detail/ColorSwatchSelector';

export function OptionPills({ label, options, selected, onSelect, getAvailable }) {
  if (!options.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--zova-text-body)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        {selected ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--zova-ink)' }}>— {selected}</span> : null}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => {
          const isSelected = option === selected;
          const isAvailable = getAvailable ? getAvailable(option) : true;

          return (
            <button
              key={option}
              type="button"
              onClick={() => (isAvailable ? onSelect(option) : null)}
              className="pdp-pill-btn"
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: `2px solid ${isSelected ? 'var(--zova-ink)' : 'var(--zova-border)'}`,
                background: isSelected ? 'var(--zova-ink)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : isAvailable ? 'var(--zova-ink)' : 'var(--zova-text-muted)',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.4,
                textDecoration: isAvailable ? 'none' : 'line-through',
                boxShadow: isSelected ? '0 4px 12px rgba(25,27,25,0.15)' : 'none',
              }}
            >
              {option}
              {isSelected ? <FiCheck size={10} style={{ marginLeft: 5, verticalAlign: 'middle' }} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuantityStepper({ quantity, setQuantity, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--zova-border)', borderRadius: 12, background: '#FFFFFF', overflow: 'hidden', height: 50, width: 'fit-content' }}>
      <button
        type="button"
        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
        disabled={quantity <= 1}
        className="pdp-qty-btn"
        style={{ width: 46, height: '100%', border: 'none', background: 'none', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: quantity <= 1 ? 'var(--zova-text-muted)' : 'var(--zova-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--zova-border)' }}
      >
        <FiMinus size={14} />
      </button>
      <span style={{ minWidth: 48, textAlign: 'center', fontSize: 15, fontWeight: 800, color: 'var(--zova-ink)', letterSpacing: '-0.02em' }}>{quantity}</span>
      <button
        type="button"
        onClick={() => setQuantity((current) => (current < max ? current + 1 : current))}
        disabled={quantity >= max}
        className="pdp-qty-btn"
        style={{ width: 46, height: '100%', border: 'none', background: 'none', cursor: quantity >= max ? 'not-allowed' : 'pointer', color: quantity >= max ? 'var(--zova-text-muted)' : 'var(--zova-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--zova-border)' }}
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
}

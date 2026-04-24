"use client";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSliders, FiTrash2 } from 'react-icons/fi';
import FilterSidebar from "./FilterSidebar";
import { useFilters } from "@/contexts/filter/FilterContext";

// Brand tokens — sourced from app/globals.css
const THEME = {
  green:       'var(--zova-primary-action)',
  greenDark:   'var(--zova-primary-action-hover)',
  greenTint:   'var(--zova-green-soft)',
  greenBorder: '#B8D4A0',
  white:       '#FFFFFF',
  charcoal:    'var(--zova-ink)',
  medGray:     'var(--zova-text-body)',
  mutedText:   'var(--zova-text-muted)',
  border:      'var(--zova-border)',
  softGray:    'var(--zova-surface-alt)',
};

export default function MobileFilterDrawer({ isOpen, onClose }) {
  const { hasActiveFilters, clearAllFilters, activeFilterCount } = useFilters();

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drawer = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 9999,
          width: 320,
          maxWidth: '90vw',
          background: THEME.white,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to   { transform: translateX(0);     opacity: 1; }
          }
        `}</style>

        {/* ── Drawer header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${THEME.border}`,
            flexShrink: 0,
            background: THEME.white,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: THEME.greenTint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiSliders size={15} style={{ color: THEME.green }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: THEME.charcoal, letterSpacing: '-0.015em' }}>
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 100,
                  fontSize: 10,
                  fontWeight: 800,
                  background: THEME.green,
                  color: THEME.white,
                  padding: '0 5px',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { clearAllFilters(); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${THEME.border}`,
                  background: THEME.softGray,
                  color: THEME.medGray,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                  e.currentTarget.style.color = '#DC2626';
                  e.currentTarget.style.borderColor = '#FECACA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = THEME.softGray;
                  e.currentTarget.style.color = THEME.medGray;
                  e.currentTarget.style.borderColor = THEME.border;
                }}
              >
                <FiTrash2 size={11} /> Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: `1px solid ${THEME.border}`,
                background: THEME.softGray,
                color: THEME.medGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable filter content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Pass onMobileClose to hide the close button inside FilterSidebar's own header */}
          <FilterSidebar onMobileClose={null} hideHeader />
        </div>

        {/* ── Footer CTA ── */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: `1px solid ${THEME.border}`,
            flexShrink: 0,
            background: THEME.white,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: THEME.green,
              color: THEME.white,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = THEME.greenDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = THEME.green)}
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(drawer, document.body);
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FiArrowRight, FiX } from 'react-icons/fi';
import { useFilters } from '@/contexts/filter/FilterContext';
import DesktopCategoryPanel from './DesktopCategoryPanel';
import MobileCategoryPanel from './MobileCategoryPanel';
import SidebarItem from './SidebarItem';

export default function CategoriesModal({ onClose }) {
  const { hierarchicalCategories, categoriesLoading } = useFilters();
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [closeBtnHover, setCloseBtnHover] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const activeCategoryNode = hierarchicalCategories?.[activeCategory];

  const handleCategoryToggle = useCallback((index) => {
    setActiveCategory(index);
    setExpandedCategory((current) => (current === index ? null : index));
  }, []);

  const modal = (
    <>
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, backgroundColor: 'rgba(25,27,25,0.55)' }}
      />

      <div
        className="zova-categories-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${'var(--zova-border)'}`,
          boxShadow: '0 20px 60px rgba(25,27,25,0.22)',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <div className="zova-categories-shell" style={{ maxWidth: 1600, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 24px',
              backgroundColor: 'var(--zova-linen)',
              borderBottom: `1px solid ${'var(--zova-border)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: 'var(--zova-accent-emphasis)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--zova-text-muted)' }}>
                Browse Categories
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              onMouseEnter={() => setCloseBtnHover(true)}
              onMouseLeave={() => setCloseBtnHover(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 13px',
                borderRadius: 6,
                border: `1px solid ${closeBtnHover ? '#f5c6c6' : 'var(--zova-border)'}`,
                backgroundColor: closeBtnHover ? '#ffecec' : '#FFFFFF',
                color: closeBtnHover ? '#c0392b' : 'var(--zova-text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.14s',
              }}
            >
              <FiX style={{ width: 12, height: 12 }} />
              Close
            </button>
          </div>

          {categoriesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: `2px solid ${'var(--zova-primary-action)'}`,
                  borderTopColor: 'transparent',
                  animation: 'zova-spin 0.7s linear infinite',
                }}
              />
            </div>
          ) : !hierarchicalCategories?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '80px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--zova-text-muted)' }}>No categories found.</p>
            </div>
          ) : (
            <div className="zova-categories-body" style={{ display: 'flex', minHeight: 440 }}>
              <div
                className="zova-categories-sidebar"
                style={{
                  width: 206,
                  flexShrink: 0,
                  backgroundColor: 'var(--zova-linen)',
                  borderRight: `1px solid ${'var(--zova-border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    padding: '13px 16px 7px',
                    margin: 0,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.22em',
                    color: 'var(--zova-text-muted)',
                  }}
                >
                  Departments
                </p>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {hierarchicalCategories.map((category, index) => {
                    const isActive = index === activeCategory;
                    const isExpanded = index === expandedCategory;

                    return (
                      <div key={category.id || index}>
                        <SidebarItem
                          category={category}
                          isActive={isActive}
                          isExpanded={isExpanded}
                          onClick={() => handleCategoryToggle(index)}
                        />
                        {isExpanded ? <MobileCategoryPanel category={category} onClose={handleClose} /> : null}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '10px', borderTop: `1px solid ${'var(--zova-border)'}`, flexShrink: 0 }}>
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px',
                      borderRadius: 8,
                      backgroundColor: 'var(--zova-primary-action)',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.14s',
                      letterSpacing: '0.03em',
                    }}
                    onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)'; }}
                    onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'var(--zova-primary-action)'; }}
                  >
                    All Products <FiArrowRight style={{ width: 12, height: 12 }} />
                  </Link>
                </div>
              </div>

              <div className="zova-categories-desktop-panel" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#FFFFFF', maxHeight: 520 }}>
                <DesktopCategoryPanel activeCategory={activeCategoryNode} onClose={handleClose} />
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes zova-spin { to { transform: rotate(360deg); } }

          .zova-categories-modal,
          .zova-categories-modal * {
            box-sizing: border-box;
          }

          .zova-categories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          @media (min-width: 1024px) {
            .zova-categories-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }

          @media (min-width: 1280px) {
            .zova-categories-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 767px) {
            .zova-categories-modal {
              top: 0 !important;
              min-height: 100dvh;
              max-height: 100dvh !important;
              border-bottom: 0 !important;
              overflow-y: auto !important;
            }

            .zova-categories-shell {
              width: 100%;
              min-height: 100dvh;
            }

            .zova-categories-body {
              display: block !important;
              min-height: 0 !important;
            }

            .zova-categories-sidebar {
              width: 100% !important;
              border-right: 0 !important;
            }

            .zova-categories-desktop-panel {
              display: none !important;
            }
          }

          @media (max-width: 520px) {
            .zova-categories-modal [style*="padding: 10px 24px"] {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
          }

          @media (min-width: 768px) and (max-width: 1023px) {
            .zova-categories-modal {
              left: 16px !important;
              right: 16px !important;
              border-radius: 8px;
              overflow: hidden !important;
            }

            .zova-categories-body {
              min-height: 420px !important;
            }

            .zova-categories-sidebar {
              width: 190px !important;
            }

            .zova-categories-content {
              padding: 20px !important;
            }

            .zova-categories-content-header {
              gap: 16px;
            }
          }

          @media (max-width: 900px) {
            .zova-categories-banner {
              align-items: flex-start !important;
              flex-direction: column;
              gap: 12px;
            }
          }
        `}</style>
      </div>
    </>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

"use client";
import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FiX, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useFilters } from '@/contexts/filter/FilterContext';

const THEME = {
  white:           '#FFFFFF',
  forest:          'var(--zova-primary-action)',
  forestLight:     'var(--zova-green-soft)',
  gold:            'var(--zova-accent-emphasis)',
  goldLight:       'var(--zova-accent-soft)',
  goldDark:        'var(--zova-warning)',
  goldBadgeBorder: '#f5d06e',
  onyx:            'var(--zova-text-body)',
  onyxMid:         'var(--zova-text-body)',
  onyxMuted:       'var(--zova-text-muted)',
};

// ============================================================

const CategoriesModal = ({ onClose }) => {
  const { hierarchicalCategories, categoriesLoading } = useFilters();
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [expandedCategory, setExpandedCategory] = React.useState(0);
  const [mounted, setMounted] = useState(false);
  const [closeBtnHover, setCloseBtnHover] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClose = useCallback(() => { onClose?.(); }, [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const activeCat = hierarchicalCategories?.[activeCategory];
  const handleCategoryToggle = useCallback((idx) => {
    setActiveCategory(idx);
    setExpandedCategory((current) => (current === idx ? null : idx));
  }, []);

  const modal = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, backgroundColor: 'rgba(25,27,25,0.55)' }}
      />

      {/* Modal panel */}
      <div
        className="zova-categories-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        onClick={(e) => e.stopPropagation()}
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

          {/* ── Top Bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 24px',
            backgroundColor: 'var(--zova-linen)',
            borderBottom: `1px solid ${'var(--zova-border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              {/* Gold Harvest stripe — from brand identity */}
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
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 13px', borderRadius: 6,
                border: `1px solid ${closeBtnHover ? '#f5c6c6' : 'var(--zova-border)'}`,
                backgroundColor: closeBtnHover ? '#ffecec' : '#FFFFFF',
                color: closeBtnHover ? '#c0392b' : 'var(--zova-text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.14s',
              }}
            >
              <FiX style={{ width: 12, height: 12 }} />
              Close
            </button>
          </div>

          {/* ── Body ── */}
          {categoriesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `2px solid ${'var(--zova-primary-action)'}`,
                borderTopColor: 'transparent',
                animation: 'zova-spin 0.7s linear infinite',
              }} />
            </div>

          ) : !hierarchicalCategories?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '80px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--zova-text-muted)' }}>No categories found.</p>
            </div>

          ) : (
            <div className="zova-categories-body" style={{ display: 'flex', minHeight: 440 }}>

              {/* ── Sidebar ── */}
              <div className="zova-categories-sidebar" style={{
                width: 206, flexShrink: 0,
                backgroundColor: 'var(--zova-linen)',
                borderRight: `1px solid ${'var(--zova-border)'}`,
                display: 'flex', flexDirection: 'column',
              }}>
                <p style={{
                  padding: '13px 16px 7px', margin: 0,
                  fontSize: 9, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.22em',
                  color: 'var(--zova-text-muted)',
                }}>
                  Departments
                </p>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {hierarchicalCategories.map((cat, idx) => {
                    const isActive = idx === activeCategory;
                    const isExpanded = idx === expandedCategory;
                    return (
                      <React.Fragment key={cat.id || idx}>
                        <SidebarItem
                          cat={cat}
                          isActive={isActive}
                          isExpanded={isExpanded}
                          onClick={() => handleCategoryToggle(idx)}
                          theme={THEME}
                        />

                        {/* ── Mobile accordion — hidden on md+ ── */}
                        {isExpanded && (
                          <div className="md:hidden" style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${'var(--zova-border)'}` }}>
                            <div style={{ padding: '12px 16px 16px' }}>
                              <Link
                                href={`/shop/${cat.slug}`}
                                onClick={handleClose}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 11, fontWeight: 700, color: 'var(--zova-primary-action)',
                                  textDecoration: 'none', marginBottom: 14,
                                }}
                              >
                                View All {cat.name} <FiArrowRight style={{ width: 12, height: 12 }} />
                              </Link>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {cat.children?.map((group, groupIdx) => (
                                  <div key={group.id || groupIdx}>
                                    <Link
                                      href={`/shop/${group.slug}`}
                                      onClick={handleClose}
                                      style={{
                                        display: 'block', fontSize: 9, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.18em',
                                        color: 'var(--zova-text-muted)', marginBottom: 8, textDecoration: 'none',
                                      }}
                                    >
                                      {group.name}
                                    </Link>
                                    <div style={{ width: 16, height: 2, backgroundColor: 'var(--zova-accent-emphasis)', opacity: 0.6, borderRadius: 2, marginBottom: 8 }} />
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                      {group.children?.map((item, itemIdx) => (
                                        <li key={item.id || itemIdx}>
                                          <Link
                                            href={`/shop/${item.slug}`}
                                            onClick={handleClose}
                                            style={{
                                              display: 'inline-flex', alignItems: 'center', gap: 5,
                                              fontSize: 12, color: 'var(--zova-text-body)', textDecoration: 'none',
                                            }}
                                          >
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                            {item.is_new && (
                                              <span style={{
                                                fontSize: 8, fontWeight: 800,
                                                padding: '2px 5px', borderRadius: 20, flexShrink: 0,
                                                backgroundColor: 'var(--zova-accent-soft)', color: 'var(--zova-warning)',
                                                border: `1px solid ${'#f5d06e'}`,
                                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                              }}>New</span>
                                            )}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              <div style={{
                                marginTop: 18, borderRadius: 10, padding: '12px 14px',
                                display: 'flex', flexDirection: 'column', gap: 10,
                                backgroundColor: 'var(--zova-green-soft)', border: `1px solid ${'#c2d9b4'}`,
                              }}>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-primary-action)', margin: 0 }}>New Arrivals</p>
                                  <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 2 }}>Fresh styles in {cat.name}</p>
                                </div>
                                <Link
                                  href={`/shop/${cat.slug}?filter=new`}
                                  onClick={handleClose}
                                  style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                    padding: '9px', borderRadius: 8,
                                    backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF',
                                    fontSize: 11, fontWeight: 700, textDecoration: 'none',
                                  }}
                                >
                                  Shop Now <FiArrowRight style={{ width: 12, height: 12 }} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div style={{ padding: '10px', borderTop: `1px solid ${'var(--zova-border)'}`, flexShrink: 0 }}>
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '9px', borderRadius: 8,
                      backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF',
                      fontSize: 11, fontWeight: 700, textDecoration: 'none',
                      transition: 'background 0.14s', letterSpacing: '0.03em',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action)')}
                  >
                    All Products <FiArrowRight style={{ width: 12, height: 12 }} />
                  </Link>
                </div>
              </div>

              {/* ── Right Panel ── */}
              <div className="zova-categories-desktop-panel" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#FFFFFF', maxHeight: 520 }}>
                {activeCat && (
                  <div className="zova-categories-content" style={{ padding: '22px 28px' }}>

                    {/* Header */}
                    <div className="zova-categories-content-header" style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      marginBottom: 20, paddingBottom: 16,
                      borderBottom: `1px solid ${'var(--zova-border)'}`,
                    }}>
                      <div>
                        <h2 style={{
                          fontSize: 24, fontWeight: 800, color: 'var(--zova-primary-action)',
                          letterSpacing: '-0.01em', lineHeight: 1.1, margin: 0,
                        }}>
                          {activeCat.name}
                        </h2>
                        <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 4 }}>
                          {activeCat.children?.reduce((acc, g) => acc + (g.children?.length || 0), 0)} styles
                          across {activeCat.children?.length} groups
                        </p>
                      </div>

                      <Link
                        href={`/shop/${activeCat.slug}`}
                        onClick={handleClose}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700, color: 'var(--zova-primary-action)',
                          textDecoration: 'none', marginTop: 3, flexShrink: 0,
                          transition: 'color 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--zova-warning)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--zova-primary-action)')}
                      >
                        View All <FiArrowRight style={{ width: 12, height: 12 }} />
                      </Link>
                    </div>

                    {/* Groups grid */}
                    <div className="zova-categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px 24px' }}>
                      {activeCat.children?.map((group, groupIdx) => (
                        <div key={group.id || groupIdx}>
                          <Link
                            href={`/shop/${group.slug}`}
                            onClick={handleClose}
                            style={{
                              display: 'block', fontSize: 10, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.17em',
                              color: 'var(--zova-text-muted)', marginBottom: 8, textDecoration: 'none',
                              transition: 'color 0.12s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--zova-primary-action)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--zova-text-muted)')}
                          >
                            {group.name}
                          </Link>

                          {/* Gold Harvest divider */}
                          <div style={{ width: 18, height: 2, backgroundColor: 'var(--zova-accent-emphasis)', opacity: 0.6, borderRadius: 2, marginBottom: 9 }} />

                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {group.children?.map((item, itemIdx) => (
                              <li key={item.id || itemIdx} style={{ marginBottom: 6 }}>
                                <GroupLink item={item} group={group} handleClose={handleClose} theme={THEME} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Banner */}
                    <div className="zova-categories-banner" style={{
                      marginTop: 22, borderRadius: 10, padding: '13px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: 'var(--zova-green-soft)',
                      border: `1px solid ${'#c2d9b4'}`,
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-primary-action)', margin: 0 }}>New Season Arrivals</p>
                        <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 2 }}>
                          Fresh styles just landed in {activeCat.name}
                        </p>
                      </div>
                      <Link
                        href={`/shop/${activeCat.slug}?filter=new`}
                        onClick={handleClose}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 7,
                          backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF',
                          fontSize: 11, fontWeight: 700, textDecoration: 'none',
                          flexShrink: 0, transition: 'background 0.14s', letterSpacing: '0.02em',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--zova-primary-action)')}
                      >
                        Shop Now <FiArrowRight style={{ width: 12, height: 12 }} />
                      </Link>
                    </div>

                  </div>
                )}
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
};

// ── Sub-components ──────────────────────────────────────────

const SidebarItem = ({ cat, isActive, isExpanded, onClick, theme }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isExpanded}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        padding: '11px 14px 11px 16px',
        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        backgroundColor: isActive ? theme.white : hovered ? theme.forestLight : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      {isActive && (
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 26, backgroundColor: theme.gold,
          borderRadius: '0 3px 3px 0',
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontSize: 12.5,
          fontWeight: isActive ? 700 : 500,
          color: isActive || hovered ? theme.forest : theme.onyx,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.12s',
        }}>
          {cat.name}
        </span>
        {cat.children?.length > 0 && (
          <span style={{ fontSize: 10, color: theme.onyxMuted, marginTop: 1, display: 'block', opacity: 0.7 }}>
            {cat.children.length} groups
          </span>
        )}
      </div>
      <FiChevronRight style={{
        width: 13, height: 13, flexShrink: 0,
        color: isExpanded || isActive ? theme.gold : theme.onyxMuted,
        opacity: isExpanded || isActive ? 1 : 0.25,
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.18s, opacity 0.14s, color 0.14s',
      }} />
    </button>
  );
};

const GroupLink = ({ item, handleClose, theme }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/shop/${item.slug}`}
      onClick={handleClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12.5,
        color: hovered ? theme.forest : theme.onyxMid,
        paddingLeft: hovered ? 3 : 0,
        textDecoration: 'none',
        transition: 'color 0.12s, padding-left 0.12s',
      }}
    >
      {item.name}
      {item.is_new && (
        <span style={{
          fontSize: 8, fontWeight: 800,
          padding: '2px 5px', borderRadius: 20,
          backgroundColor: theme.goldLight, color: theme.goldDark,
          border: `1px solid ${theme.goldBadgeBorder}`,
          textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
        }}>
          New
        </span>
      )}
    </Link>
  );
};

export default CategoriesModal;

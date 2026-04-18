"use client";
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  FiX, FiChevronRight, FiUser, FiBox,
  FiBriefcase, FiStar, FiArrowRight, FiGrid,
} from 'react-icons/fi';
import { useFilters } from '@/contexts/FilterContext';

// ============================================================
// 🎨 THEME — edit here only
// ============================================================
const THEME = {
  // Backdrop
  overlay:              "rgba(10,61,46,0.45)",

  // Modal shell
  modalBg:              "#FFFFFF",
  modalBorder:          "#E8E8E8",
  modalShadow:          "0 20px 60px rgba(10,61,46,0.18)",

  // Top bar
  topBarBg:             "#FFFFFF",
  topBarBorder:         "#F0F0F0",
  topBarLabel:          "#666666",
  topBarLabelIcon:      "#00B86B",

  // Close button
  closeBg:              "#F5F5F5",
  closeBorder:          "#E8E8E8",
  closeText:            "#666666",
  closeHoverBg:         "#FFEEEE",
  closeHoverText:       "#ef4444",
  closeHoverBorder:     "#fecdd3",

  // Left sidebar
  sidebarBg:            "#F9FAFB",
  sidebarBorder:        "#F0F0F0",
  sidebarText:          "#666666",
  sidebarHoverBg:       "#EDFAF3",
  sidebarHoverText:     "#0A3D2E",
  sidebarActiveBg:      "#FFFFFF",
  sidebarActiveBar:     "#00B86B",
  sidebarActiveText:    "#0A3D2E",
  sidebarIconBg:        "#F0F0F0",
  sidebarIconActiveBg:  "#EDFAF3",
  sidebarIconActiveColor:"#00B86B",

  // Right panel
  panelBg:              "#FFFFFF",
  panelHeading:         "#111111",
  panelSubText:         "#666666",
  groupLabel:           "#666666",
  groupLabelHover:      "#00B86B",
  itemText:             "#333333",
  itemHover:            "#00B86B",
  accentDivider:        "#00B86B",

  // Badges
  badgeBg:              "#EDFAF3",
  badgeText:            "#0A3D2E",
  badgeBorder:          "#A8DFC4",

  // CTA
  ctaBg:                "#00B86B",
  ctaHoverBg:           "#0F7A4F",
  ctaText:              "#FFFFFF",
  ctaGhostText:         "#00B86B",
  ctaGhostHover:        "#0F7A4F",

  // Banner strip
  bannerBg:             "#F0FBF5",
  bannerBorder:         "#A8DFC4",

  // States
  spinner:              "#00B86B",
  emptyText:            "#999999",
};
// ============================================================

const iconMap = (slug) => {
  if (slug?.includes('women'))       return FiUser;
  if (slug?.includes('men'))         return FiUser;
  if (slug?.includes('accessories')) return FiBriefcase;
  if (slug?.includes('new') || slug?.includes('featured')) return FiStar;
  return FiBox;
};

const CategoriesModal = ({ onClose }) => {
  const { hierarchicalCategories, categoriesLoading } = useFilters();
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [mounted, setMounted] = useState(false);

  // Must wait for client mount before using createPortal
  useEffect(() => { setMounted(true); }, []);

  // Stable close handler
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Keyboard escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const activeCat = hierarchicalCategories?.[activeCategory];

  // ── Actual modal markup ──
  const modal = (
    <>
      {/* Backdrop — rendered at body level, fully isolated */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: THEME.overlay,
        }}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 64,              // ← match your header height in px
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: THEME.modalBg,
          borderBottom: `1px solid ${THEME.modalBorder}`,
          boxShadow: THEME.modalShadow,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
        // IMPORTANT: stop clicks inside the panel from hitting the backdrop
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

          {/* ── Top Bar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              backgroundColor: THEME.topBarBg,
              borderBottom: `1px solid ${THEME.topBarBorder}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiGrid style={{ width: 14, height: 14, color: THEME.topBarLabelIcon }} />
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: THEME.topBarLabel,
              }}>
                Browse Categories
              </span>
            </div>

            {/* ── Close button — direct onClick, no nesting issues ── */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                border: `1px solid ${THEME.closeBorder}`,
                backgroundColor: THEME.closeBg,
                color: THEME.closeText,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = THEME.closeHoverBg;
                e.currentTarget.style.color = THEME.closeHoverText;
                e.currentTarget.style.borderColor = THEME.closeHoverBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME.closeBg;
                e.currentTarget.style.color = THEME.closeText;
                e.currentTarget.style.borderColor = THEME.closeBorder;
              }}
            >
              <FiX style={{ width: 13, height: 13 }} />
              Close
            </button>
          </div>

          {/* ── Body ── */}
          {categoriesLoading ? (
            <div className="flex justify-center py-20">
              <div
                className="w-7 h-7 rounded-full border-2 animate-spin"
                style={{ borderColor: THEME.spinner, borderTopColor: 'transparent' }}
              />
            </div>

          ) : !hierarchicalCategories?.length ? (
            <div className="flex flex-col items-center gap-2 py-20">
              <FiBox className="w-8 h-8" style={{ color: THEME.emptyText }} />
              <p className="text-sm" style={{ color: THEME.emptyText }}>No categories found.</p>
            </div>

          ) : (
            <div className="flex flex-col md:flex-row" style={{ minHeight: 440 }}>

              {/* ── Left Sidebar (Accordion on Mobile, Sidebar on Desktop) ── */}
              <div
                className="flex flex-col py-3 md:w-[240px] w-full shrink-0"
                style={{
                  backgroundColor: THEME.sidebarBg,
                  borderRight: `1px solid ${THEME.sidebarBorder}`,
                }}
              >
                <p
                  className="px-5 pb-3 text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: THEME.groupLabel }}
                >
                  Departments
                </p>

                <div className="flex-1 overflow-y-auto">
                  {hierarchicalCategories.map((cat, idx) => {
                    const Icon = iconMap(cat.slug);
                    const isActive = idx === activeCategory;
                    return (
                      <React.Fragment key={cat.id || idx}>
                        <button
                          type="button"
                        onClick={() => setActiveCategory(idx)}
                        className="relative flex items-center gap-3 px-4 py-3 text-left w-full transition-all duration-150"
                        style={{
                          backgroundColor: isActive ? THEME.sidebarActiveBg : 'transparent',
                          color: isActive ? THEME.sidebarActiveText : THEME.sidebarText,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = THEME.sidebarHoverBg;
                            e.currentTarget.style.color = THEME.sidebarHoverText;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = THEME.sidebarText;
                          }
                        }}
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full"
                            style={{ backgroundColor: THEME.sidebarActiveBar }}
                          />
                        )}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isActive ? THEME.sidebarIconActiveBg : THEME.sidebarIconBg }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: isActive ? THEME.sidebarIconActiveColor : THEME.sidebarText }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold truncate">{cat.name}</span>
                          {cat.children?.length > 0 && (
                            <span className="text-[10px] opacity-50">{cat.children.length} groups</span>
                          )}
                        </div>
                        <FiChevronRight
                          className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                          style={{
                            color: isActive ? THEME.sidebarActiveBar : THEME.sidebarText,
                            opacity: isActive ? 1 : 0.25,
                            transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>

                      {/* ── Mobile Accordion Content ── */}
                      {isActive && (
                        <div className="md:hidden px-4 pb-4 bg-white/50">
                          <div className="pt-2">
                            <Link
                              href={`/shop/${cat.slug}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 text-xs font-bold mb-4 transition-colors"
                              style={{ color: THEME.ctaGhostText }}
                            >
                              View All {cat.name} <FiArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <div className="space-y-6">
                              {cat.children?.map((group, groupIdx) => (
                                <div key={group.id || groupIdx}>
                                  <Link
                                    href={`/shop/${group.slug}`}
                                    onClick={handleClose}
                                    className="block text-[11px] font-black uppercase tracking-[0.15em] mb-2 transition-colors"
                                    style={{ color: THEME.groupLabel }}
                                  >
                                    {group.name}
                                  </Link>
                                  <div
                                    className="w-5 h-[2px] mb-2 rounded-full"
                                    style={{ backgroundColor: THEME.accentDivider, opacity: 0.4 }}
                                  />
                                  <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {group.children?.map((item, itemIdx) => (
                                      <li key={item.id || itemIdx}>
                                        <Link
                                          href={`/shop/${item.slug}`}
                                          onClick={handleClose}
                                          className="text-sm inline-flex items-center gap-1.5 transition-all"
                                          style={{ color: THEME.itemText }}
                                        >
                                          <span className="truncate">{item.name}</span>
                                          {item.is_new && (
                                            <span
                                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                              style={{
                                                backgroundColor: THEME.badgeBg,
                                                color: THEME.badgeText,
                                                border: `1px solid ${THEME.badgeBorder}`,
                                              }}
                                            >
                                              NEW
                                            </span>
                                          )}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                            
                            {/* Mobile Banner strip */}
                            <div
                              className="mt-6 rounded-xl p-4 flex flex-col gap-3"
                              style={{ backgroundColor: THEME.bannerBg, border: `1px solid ${THEME.bannerBorder}` }}
                            >
                              <div>
                                <p className="text-sm font-bold" style={{ color: THEME.panelHeading }}>
                                  New Arrivals
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: THEME.panelSubText }}>
                                  Fresh styles in {cat.name}
                                </p>
                              </div>
                              <Link
                                href={`/shop/${cat.slug}?filter=new`}
                                onClick={handleClose}
                                className="w-full justify-center py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                style={{ backgroundColor: THEME.ctaBg, color: THEME.ctaText }}
                              >
                                Shop Now <FiArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

                {/* Sidebar CTA */}
                <div
                  className="px-4 pt-3 pb-4 shrink-0 mt-auto"
                  style={{ borderTop: `1px solid ${THEME.sidebarBorder}` }}
                >
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-colors"
                    style={{ backgroundColor: THEME.ctaBg, color: THEME.ctaText }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.ctaHoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.ctaBg)}
                  >
                    All Products <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* ── Right Panel (Desktop Only) ── */}
              <div
                className="hidden md:block flex-1 overflow-y-auto"
                style={{ backgroundColor: THEME.panelBg, maxHeight: 520 }}
              >
                {activeCat && (
                  <div className="py-8 px-8">

                    {/* Panel header */}
                    <div className="flex items-start justify-between mb-7">
                      <div>
                        <h2 className="text-2xl font-black" style={{ color: THEME.panelHeading }}>
                          {activeCat.name}
                        </h2>
                        <p className="text-xs mt-1" style={{ color: THEME.panelSubText }}>
                          {activeCat.children?.reduce((acc, g) => acc + (g.children?.length || 0), 0)} styles across{' '}
                          {activeCat.children?.length} groups
                        </p>
                      </div>
                      <Link
                        href={`/shop/${activeCat.slug}`}
                        onClick={handleClose}
                        className="flex items-center gap-1 text-xs font-bold mt-1 transition-colors"
                        style={{ color: THEME.ctaGhostText }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = THEME.ctaGhostHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = THEME.ctaGhostText)}
                      >
                        View All <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Groups grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8">
                      {activeCat.children?.map((group, groupIdx) => (
                        <div key={group.id || groupIdx}>
                          <Link
                            href={`/shop/${group.slug}`}
                            onClick={handleClose}
                            className="block text-[11px] font-black uppercase tracking-[0.15em] mb-3 transition-colors"
                            style={{ color: THEME.groupLabel }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = THEME.groupLabelHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = THEME.groupLabel)}
                          >
                            {group.name}
                          </Link>
                          <div
                            className="w-5 h-[2px] mb-3 rounded-full"
                            style={{ backgroundColor: THEME.accentDivider, opacity: 0.4 }}
                          />
                          <ul className="space-y-2.5">
                            {group.children?.map((item, itemIdx) => (
                              <li key={item.id || itemIdx}>
                                <Link
                                  href={`/shop/${item.slug}`}
                                  onClick={handleClose}
                                  className="text-sm inline-flex items-center gap-2 transition-all"
                                  style={{ color: THEME.itemText }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = THEME.itemHover;
                                    e.currentTarget.style.paddingLeft = '4px';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = THEME.itemText;
                                    e.currentTarget.style.paddingLeft = '0';
                                  }}
                                >
                                  {item.name}
                                  {item.is_new && (
                                    <span
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: THEME.badgeBg,
                                        color: THEME.badgeText,
                                        border: `1px solid ${THEME.badgeBorder}`,
                                      }}
                                    >
                                      NEW
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Banner strip */}
                    <div
                      className="mt-10 rounded-2xl p-5 flex items-center justify-between"
                      style={{ backgroundColor: THEME.bannerBg, border: `1px solid ${THEME.bannerBorder}` }}
                    >
                      <div>
                        <p className="text-sm font-bold" style={{ color: THEME.panelHeading }}>
                          New Season Arrivals
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: THEME.panelSubText }}>
                          Fresh styles just landed in {activeCat.name}
                        </p>
                      </div>
                      <Link
                        href={`/shop/${activeCat.slug}?filter=new`}
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                        style={{ backgroundColor: THEME.ctaBg, color: THEME.ctaText }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.ctaHoverBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.ctaBg)}
                      >
                        Shop Now <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );

  // Only render portal on client
  if (!mounted) return null;
  return createPortal(modal, document.body);
};

export default CategoriesModal;
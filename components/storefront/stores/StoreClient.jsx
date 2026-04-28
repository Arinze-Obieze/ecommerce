"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiGrid, FiChevronRight, FiFilter, FiSliders, FiTag, FiX,
} from "react-icons/fi";
import ProductGrid from '@/components/catalog/browse/ProductGrid';
import { getStoreProducts } from "@/features/catalog/api/client";
import StoreEntranceOverlay from '@/components/storefront/stores/StoreEntranceOverlay';
import { ActiveFilters, StoreHeader, STORE_TABS } from '@/components/storefront/stores/StoreChrome';

// ═════════════════════════════════════════════════════════════
// FILTER SIDEBAR
// ═════════════════════════════════════════════════════════════

function CategorySkeleton() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          height:34, borderRadius:8,
          background:`linear-gradient(90deg, ${'var(--zova-border)'} 0%, #e8e3da 50%, ${'var(--zova-border)'} 100%)`,
          backgroundSize:"200% 100%",
          animation:"shimmer 1.4s ease infinite",
          animationDelay:`${i * 0.08}s`,
        }}/>
      ))}
    </div>
  );
}

function FilterSidebar({
  categories,
  categoriesLoading,
  selectedCategory,
  onCategoryChange,
  productCount,
  activeTab,
  // mobile
  mobileOpen,
  onMobileClose,
  hideDesktopSidebar = false,
}) {
  const [expandedParents, setExpandedParents] = useState(new Set());

  // Separate parent categories and their children
  const parents   = categories.filter(c => !c.parent_id);
  const childMap  = categories.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const toggleParent = (id) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sidebarContent = (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Sidebar header */}
      <div style={{
        padding:"16px 16px 12px",
        borderBottom:`1px solid ${'var(--zova-border)'}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <FiSliders size={14} style={{ color:'var(--zova-primary-action)' }}/>
          <span style={{ fontSize:12, fontWeight:800, color:'var(--zova-ink)', letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Helvetica Neue', sans-serif" }}>
            Filter
          </span>
        </div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            style={{
              fontSize:10, fontWeight:700, color:'var(--zova-primary-action)',
              background:'var(--zova-green-soft)', border:`1px solid ${'#B8D4A0'}`,
              borderRadius:100, padding:"2px 9px", cursor:"pointer",
            }}
          >
            Clear
          </button>
        )}
        {/* Mobile close */}
        <button
          type="button"
          onClick={onMobileClose}
          style={{
            display:"none", // shown via media query class
            width:28, height:28, borderRadius:7,
            border:`1px solid ${'var(--zova-border)'}`, background:'#FFFFFF',
            alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}
          className="sidebar-close-btn"
        >
          <FiX size={14} style={{ color:'var(--zova-ink)' }}/>
        </button>
      </div>

      {/* All products */}
      <div style={{ padding:"10px 10px 6px" }}>
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          style={{
            width:"100%", textAlign:"left",
            padding:"9px 10px",
            borderRadius:9,
            border:"none",
            background:!selectedCategory ? 'var(--zova-green-soft)' : "transparent",
            color:!selectedCategory ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
            fontSize:13, fontWeight:!selectedCategory ? 700 : 500,
            cursor:"pointer", transition:"all 0.14s",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}
        >
          <span style={{ display:"flex", alignItems:"center", gap:7 }}>
            <FiGrid size={12}/>
            All Categories
          </span>
          {!selectedCategory && (
            <span style={{
              fontSize:10, fontWeight:700,
              background:'var(--zova-primary-action)', color:'#FFFFFF',
              borderRadius:100, padding:"1px 7px",
            }}>
              {productCount}
            </span>
          )}
        </button>
      </div>

      {/* Category list */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 10px 16px" }}>
        {categoriesLoading ? (
          <div style={{ padding:"6px 6px" }}><CategorySkeleton/></div>
        ) : parents.length === 0 ? (
          <div style={{ padding:"16px 10px", fontSize:12, color:'var(--zova-text-muted)', textAlign:"center" }}>
            No categories found
          </div>
        ) : (
          parents.map(parent => {
            const children      = childMap[parent.id] || [];
            const hasChildren   = children.length > 0;
            const isExpanded    = expandedParents.has(parent.id);
            const isParentSel   = selectedCategory === String(parent.id);
            const isChildSel    = children.some(c => selectedCategory === String(c.id));
            const isHighlighted = isParentSel || isChildSel;

            return (
              <div key={parent.id} style={{ marginBottom:2 }}>
                {/* Parent row */}
                <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(String(parent.id))}
                    style={{
                      flex:1, textAlign:"left",
                      padding:"9px 10px 9px 10px",
                      borderRadius:9,
                      border:"none",
                      background:isParentSel ? 'var(--zova-green-soft)' : "transparent",
                      color:isHighlighted ? 'var(--zova-primary-action)' : 'var(--zova-ink)',
                      fontSize:13, fontWeight:isHighlighted ? 700 : 500,
                      cursor:"pointer", transition:"all 0.14s",
                      display:"flex", alignItems:"center", gap:7,
                    }}
                  >
                    <FiTag size={11} style={{ flexShrink:0, opacity:0.6 }}/>
                    <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {parent.name}
                    </span>
                  </button>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleParent(parent.id)}
                      style={{
                        width:28, height:28, borderRadius:7, flexShrink:0,
                        border:"none", background:"transparent",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        cursor:"pointer", color:'var(--zova-text-muted)',
                      }}
                    >
                      <FiChevronRight size={13} style={{ transform:isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}/>
                    </button>
                  )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div style={{ paddingLeft:18, marginBottom:2 }}>
                    {children.map(child => {
                      const isChildSelected = selectedCategory === String(child.id);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => onCategoryChange(String(child.id))}
                          style={{
                            width:"100%", textAlign:"left",
                            padding:"8px 10px",
                            borderRadius:7, border:"none",
                            background:isChildSelected ? 'var(--zova-green-soft)' : "transparent",
                            color:isChildSelected ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
                            fontSize:12, fontWeight:isChildSelected ? 700 : 400,
                            cursor:"pointer", transition:"all 0.14s",
                            display:"flex", alignItems:"center", gap:7,
                          }}
                        >
                          <div style={{
                            width:5, height:5, borderRadius:"50%", flexShrink:0,
                            background:isChildSelected ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)',
                          }}/>
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Active filter summary */}
      {selectedCategory && (
        <div style={{
          padding:"12px 16px",
          borderTop:`1px solid ${'var(--zova-border)'}`,
          background:'var(--zova-green-soft)',
        }}>
          {(() => {
            const cat = categories.find(c => String(c.id) === selectedCategory);
            return cat ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--zova-primary-action)' }}>
                  Filtered: {cat.name}
                </span>
                <button
                  type="button"
                  onClick={() => onCategoryChange(null)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:'var(--zova-primary-action)', display:"flex", alignItems:"center" }}
                >
                  <FiX size={13}/>
                </button>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {!hideDesktopSidebar && (
        <aside style={{
          width:220,
          flexShrink:0,
          background:'#FFFFFF',
          border:`1px solid ${'var(--zova-border)'}`,
          borderRadius:14,
          overflow:"hidden",
          alignSelf:"flex-start",
          position:"sticky",
          top:24,
        }}>
          {sidebarContent}
        </aside>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={onMobileClose}
            style={{
              position:"fixed", inset:0, zIndex:500,
              background:"rgba(25,27,25,0.45)",
              backdropFilter:"blur(2px)",
            }}
          />
          <aside style={{
            position:"fixed", top:0, left:0, bottom:0,
            width:280, zIndex:501,
            background:'#FFFFFF',
            boxShadow:"4px 0 32px rgba(0,0,0,0.18)",
            display:"flex", flexDirection:"column",
            overflow:"hidden",
          }}>
            <div style={{ padding:"16px 16px 12px", borderBottom:`1px solid ${'var(--zova-border)'}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <FiSliders size={14} style={{ color:'var(--zova-primary-action)' }}/>
                <span style={{ fontSize:12, fontWeight:800, color:'var(--zova-ink)', letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  Filter by Category
                </span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                style={{
                  width:30, height:30, borderRadius:8,
                  border:`1px solid ${'var(--zova-border)'}`, background:'#FFFFFF',
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                }}
              >
                <FiX size={15} style={{ color:'var(--zova-ink)' }}/>
              </button>
            </div>
            <div style={{ flex:1, overflowY:"auto" }}>
              {/* Reuse content without the header */}
              <div style={{ padding:"10px 10px 6px" }}>
                <button
                  type="button"
                  onClick={() => { onCategoryChange(null); onMobileClose(); }}
                  style={{
                    width:"100%", textAlign:"left", padding:"9px 10px",
                    borderRadius:9, border:"none",
                    background:!selectedCategory ? 'var(--zova-green-soft)' : "transparent",
                    color:!selectedCategory ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
                    fontSize:13, fontWeight:!selectedCategory ? 700 : 500,
                    cursor:"pointer",
                    display:"flex", alignItems:"center", gap:7,
                  }}
                >
                  <FiGrid size={12}/> All Categories
                </button>
              </div>
              <div style={{ padding:"0 10px 16px" }}>
                {categoriesLoading ? <CategorySkeleton/> : parents.map(parent => {
                  const children   = childMap[parent.id] || [];
                  const hasChildren= children.length > 0;
                  const isExpanded = expandedParents.has(parent.id);
                  const isParentSel= selectedCategory === String(parent.id);
                  const isChildSel = children.some(c => selectedCategory === String(c.id));

                  return (
                    <div key={parent.id} style={{ marginBottom:2 }}>
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <button
                          type="button"
                          onClick={() => { onCategoryChange(String(parent.id)); onMobileClose(); }}
                          style={{
                            flex:1, textAlign:"left", padding:"9px 10px",
                            borderRadius:9, border:"none",
                            background:isParentSel ? 'var(--zova-green-soft)' : "transparent",
                            color:(isParentSel||isChildSel) ? 'var(--zova-primary-action)' : 'var(--zova-ink)',
                            fontSize:13, fontWeight:(isParentSel||isChildSel) ? 700 : 500,
                            cursor:"pointer",
                            display:"flex", alignItems:"center", gap:7,
                          }}
                        >
                          <FiTag size={11} style={{ flexShrink:0, opacity:0.6 }}/>
                          {parent.name}
                        </button>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleParent(parent.id)}
                            style={{ width:28, height:28, borderRadius:7, border:"none", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:'var(--zova-text-muted)' }}
                          >
                            <FiChevronRight size={13} style={{ transform:isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}/>
                          </button>
                        )}
                      </div>
                      {hasChildren && isExpanded && (
                        <div style={{ paddingLeft:18 }}>
                          {children.map(child => {
                            const isSel = selectedCategory === String(child.id);
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => { onCategoryChange(String(child.id)); onMobileClose(); }}
                                style={{
                                  width:"100%", textAlign:"left", padding:"8px 10px",
                                  borderRadius:7, border:"none",
                                  background:isSel ? 'var(--zova-green-soft)' : "transparent",
                                  color:isSel ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
                                  fontSize:12, fontWeight:isSel ? 700 : 400,
                                  cursor:"pointer",
                                  display:"flex", alignItems:"center", gap:7,
                                }}
                              >
                                <div style={{ width:5, height:5, borderRadius:"50%", flexShrink:0, background:isSel ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)' }}/>
                                {child.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// ACTIVE FILTER BADGE (shown above product grid)
// ═════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════
export default function StoreClient({ store }) {
  const [entranceDone, setEntranceDone] = useState(false);

  // Products state
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [page, setPage]                   = useState(1);
  const [meta, setMeta]                   = useState(null);

  // Filter / sort state
  const [activeTab, setActiveTab]             = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Categories state
  const [categories, setCategories]           = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Fetch categories once ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/categories?active=true");
        const data = await res.json();
        if (data.success) setCategories(data.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  // ── Fetch products (reactive to page, tab, category) ───────
  useEffect(() => {
    if (!store?.id) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getStoreProducts(store.id, page, 20);
        if (data.success) {
          setProducts(prev => page === 1 ? data.data : [...prev, ...data.data]);
          setMeta(data.meta || null);
        } else {
          setError(data.error || "Failed to load products");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [store?.id, page, activeTab, selectedCategory]);

  // ── Tab change — reset products & page ────────────────────
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setProducts([]);
    setError(null);
  }, []);

  // ── Category change — reset products & page ───────────────
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setProducts([]);
    setError(null);
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        /* Responsive sidebar */
        @media (max-width: 768px) {
          .store-layout-sidebar { display: none !important; }
          .mobile-filter-btn    { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter-btn    { display: none !important; }
        }
      `}</style>

      {!entranceDone && (
        <StoreEntranceOverlay
          storeName={store?.name || "This Store"}
          onDone={() => setEntranceDone(true)}
        />
      )}

      <div style={{
        minHeight:"100vh",
        background:'var(--zova-linen)',
        opacity:entranceDone ? 1 : 0,
        transform:entranceDone ? "translateY(0)" : "translateY(14px)",
        transition:"opacity 0.7s ease, transform 0.7s ease",
      }}>
        <StoreHeader
          store={store}
          productCount={products.length}
          loading={loading}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <main style={{ maxWidth:1440, margin:"0 auto", padding:"36px 32px 96px" }}>

          {/* ── Top bar: title + mobile filter btn ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:'var(--zova-text-muted)', margin:"0 0 4px", fontFamily: "var(--zova-font-sans)" }}>Browse</p>
              <h2 style={{ fontSize:20, fontWeight:900, color:'var(--zova-ink)', margin:0, letterSpacing:"-0.03em", fontFamily: "var(--zova-font-display)", display:"flex", alignItems:"center", gap:10 }}>
                {STORE_TABS.find(t => t.id === activeTab)?.label || "All Products"}
                {!loading && products.length > 0 && (
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--zova-primary-action)', background:'var(--zova-green-soft)', padding:"2px 10px", borderRadius:100, border:`1px solid ${'#B8D4A0'}`, fontFamily: "var(--zova-font-sans)", letterSpacing:0 }}>
                    {products.length}
                  </span>
                )}
              </h2>
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              className="mobile-filter-btn"
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                display:"none", // overridden by CSS
                alignItems:"center", gap:7,
                padding:"9px 16px", borderRadius:10,
                border:`1.5px solid ${selectedCategory ? 'var(--zova-primary-action)' : 'var(--zova-border)'}`,
                background:selectedCategory ? 'var(--zova-green-soft)' : '#FFFFFF',
                color:selectedCategory ? 'var(--zova-primary-action)' : 'var(--zova-ink)',
                fontSize:13, fontWeight:600, cursor:"pointer",
              }}
            >
              <FiFilter size={13}/>
              {selectedCategory
                ? `${categories.find(c => String(c.id) === selectedCategory)?.name || "Filtered"}`
                : "Filter"
              }
            </button>
          </div>

          {/* ── Active filter pills ── */}
          <ActiveFilters
            selectedCategory={selectedCategory}
            categories={categories}
            activeTab={activeTab}
            onClearCategory={() => handleCategoryChange(null)}
          />

          {/* ── Two-column layout: sidebar + grid ── */}
          <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

            {/* Desktop sidebar */}
            <div className="store-layout-sidebar" style={{ width:220, flexShrink:0 }}>
              <FilterSidebar
                categories={categories}
                categoriesLoading={categoriesLoading}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                productCount={products.length}
                activeTab={activeTab}
                mobileOpen={false}
                onMobileClose={() => {}}
              />
            </div>

            {/* Product grid */}
            <div style={{ flex:1, minWidth:0 }}>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                meta={meta?.pagination || null}
                surface="store_page"
                trackingMeta={meta?.scoring || null}
                onLoadMore={() => setPage(p => p + 1)}
                gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      <FilterSidebar
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        productCount={products.length}
        activeTab={activeTab}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        hideDesktopSidebar={true}
      />
    </>
  );
}

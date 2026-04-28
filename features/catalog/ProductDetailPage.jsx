"use client";
import React from 'react';
import { FiCheck, FiChevronLeft } from 'react-icons/fi';
import Link from 'next/link';
import RecentlyViewedProducts from '@/components/catalog/RecentlyViewedProducts';
import RelatedProducts from '@/components/catalog/RelatedProducts';
import ImageGallery from '@/features/catalog/product-detail/ImageGallery';
import {
  ProductDetailPurchasePanel,
  ProductDetailStickyCta,
} from '@/features/catalog/product-detail/ProductDetailPurchasePanel';
import {
  MobileSection,
  SectionContent,
  TABS,
  TabBar,
} from '@/features/catalog/product-detail/ProductDetailSections';
import useProductDetailPage from '@/features/catalog/product-detail/useProductDetailPage';

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ProductPage({ params }) {
  const pdp = useProductDetailPage(params);

  // ── LOADING ──
  if (pdp.loading) return (
    <div className="pdp-root zova-page" style={{ minHeight:'100vh',padding:'60px 24px' }}>
      <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gap:48 }} className="lg:grid-cols-2">
        {[['100%'],['100%','60%','80%','40%']].map((widths,gi) => (
          <div key={gi} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {widths.map((w,i) => (
              <div key={i} className="animate-pulse" style={{
                width:w, aspectRatio:i===0&&gi===0?'3/4':undefined,
                height:i===0&&gi===0?undefined:24,
                borderRadius:i===0&&gi===0?20:8,
                background:'var(--zova-surface-alt)',
                animation:'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );

  if (!pdp.product) return (
    <div className="pdp-root zova-page" style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16 }}>
      <p style={{ fontSize:18,fontWeight:800,color:'var(--zova-ink)' }}>Product not found</p>
      <Link href="/shop" style={{ color:'var(--zova-primary-action)',fontWeight:600,fontSize:14 }}>← Back to Shop</Link>
    </div>
  );

  return (
    <div className="pdp-root zova-page" style={{ minHeight:'100vh' }}>
      {/* TOAST — Onyx Black */}
      {pdp.toast && (
        <div style={{
          position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',zIndex:9999,
          background:'var(--zova-ink)',color:'#FFFFFF',padding:'11px 22px',borderRadius:100,
          fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,
          boxShadow:'0 24px 56px rgba(25,27,25,0.14)',whiteSpace:'nowrap',
        }} className="pdp-fade-in">
          <FiCheck size={13} style={{ color:'var(--zova-accent-emphasis)' }} /> {pdp.toast}
        </div>
      )}

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'28px 16px 100px' }} className="lg:px-8 lg:pb-24 lg:pt-10">

        {/* BACK */}
        <div style={{ marginBottom:32 }}>
          <button onClick={() => pdp.router.back()} type="button"
            style={{
              display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:100,
              border:`1.5px solid ${'var(--zova-border)'}`,background:'#FFFFFF',color:'var(--zova-text-body)',
              fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em',transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--zova-primary-action)'; e.currentTarget.style.color='var(--zova-primary-action)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--zova-border)'; e.currentTarget.style.color='var(--zova-text-body)'; }}
          >
            <FiChevronLeft size={14} /> Back
          </button>
        </div>

        {/* MAIN GRID */}
        <div style={{ display:'grid',gap:40,alignItems:'start' }} className="lg:grid-cols-2 lg:gap-16">

          <ImageGallery media={pdp.galleryMedia} productName={pdp.product.name} isDesktop={pdp.isDesktop} />
          <ProductDetailPurchasePanel
            product={pdp.product}
            inWishlist={pdp.inWishlist}
            toggleWishlist={pdp.toggleWishlist}
            handleShare={pdp.handleShare}
            storeName={pdp.storeName}
            promotions={pdp.promotions}
            currentPrice={pdp.currentPrice}
            compareAtPrice={pdp.compareAtPrice}
            activeDiscPct={pdp.activeDiscPct}
            bulkPricing={pdp.bulkPricing}
            quantity={pdp.quantity}
            sizeOptions={pdp.sizeOptions}
            selectedSize={pdp.selectedSize}
            setSelectedSize={pdp.setSelectedSize}
            colorOptions={pdp.colorOptions}
            selectedColor={pdp.selectedColor}
            setSelectedColor={pdp.setSelectedColor}
            variants={pdp.variants}
            effectiveStock={pdp.effectiveStock}
            selectedVariantLabel={pdp.selectedVariantLabel}
            requiresVariant={pdp.requiresVariant}
            selectedVariant={pdp.selectedVariant}
            canAddToCart={pdp.canAddToCart}
            addedAnim={pdp.addedAnim}
            cartLabel={pdp.cartLabel}
            handleAddToCart={pdp.handleAddToCart}
            bulkTiers={pdp.bulkTiers}
            calculateTierPricing={pdp.calculateTierPricing}
            setQuantity={pdp.setQuantity}
          />
        </div>

        {/* MOBILE ACCORDIONS */}
        {!pdp.isDesktop && (
          <div style={{ marginTop:40,display:'grid',gap:10 }}>
            {TABS.map(({ id, label }) => {
              const title = id==='reviews' ? `Reviews (${pdp.product.reviews?.length||0})` : id==='policies' ? 'Delivery & Returns' : label;
              return (
                <MobileSection key={id} id={id} title={title} open={pdp.openSection===id} onToggle={() => pdp.setOpenSection((current) => current===id?'':id)}>
                  <SectionContent id={id} {...pdp.sectionProps} />
                </MobileSection>
              );
            })}
          </div>
        )}

        {/* DESKTOP TABS */}
        {pdp.isDesktop && (
          <div style={{ marginTop:64,border:`1px solid ${'var(--zova-border)'}`,borderRadius:20,overflow:'hidden',background:'#FFFFFF',boxShadow:'0 2px 16px rgba(25,27,25,0.06)' }}>
            <TabBar active={pdp.activeTab} setActive={pdp.setActiveTab} reviewCount={pdp.product.reviews?.length||0} />
            <div style={{ padding:'36px 32px' }} className="pdp-fade-in" key={pdp.activeTab}>
              <SectionContent id={pdp.activeTab} {...pdp.sectionProps} />
            </div>
          </div>
        )}

        <div style={{ marginTop:72,display:'flex',flexDirection:'column',gap:56 }}>
          <RelatedProducts currentProductId={pdp.product.id} categorySlug={pdp.product.categories?.[0]?.slug||null} storeId={pdp.product.stores?.id} />
          <RecentlyViewedProducts currentProductId={pdp.product.id} />
        </div>
      </div>

      <ProductDetailStickyCta
        isDesktop={pdp.isDesktop}
        promotions={pdp.promotions}
        currentPrice={pdp.currentPrice}
        selectedVariantLabel={pdp.selectedVariantLabel}
        handleAddToCart={pdp.handleAddToCart}
        canAddToCart={pdp.canAddToCart}
        addedAnim={pdp.addedAnim}
        cartLabel={pdp.cartLabel}
      />
    </div>
  );
}

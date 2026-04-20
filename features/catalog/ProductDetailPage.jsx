"use client";
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiShoppingCart, FiHeart, FiStar, FiChevronLeft,
  FiMinus, FiPlus, FiShare2, FiCheck, FiShield,
  FiZoomIn, FiChevronDown, FiTruck, FiRefreshCw,
  FiTag, FiX,
} from 'react-icons/fi';
import { useCart } from '@/contexts/cart/CartContext';
import { useWishlist } from '@/contexts/wishlist/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import RecentlyViewedProducts from '@/components/catalog/RecentlyViewedProducts';
import RelatedProducts from '@/components/catalog/RelatedProducts';
import { DEFAULT_RETURN_POLICY } from '@/utils/catalog/return-policy';
import { calculateBulkPricing, getBulkDiscountTiers } from '@/utils/catalog/bulk-pricing';
import { logProductEvent } from '@/utils/telemetry/product-events';
import { computeSavingsLabel } from '@/utils/catalog/promotions';

// ─────────────────────────────────────────────────────────────
// 🎨 ZOVA BRAND TOKENS — zova.ng brand guidelines 2026
// ─────────────────────────────────────────────────────────────
const T = {
  // Zova Forest — primary / CTAs / icons
  green:       '#2E6417',
  greenDark:   '#1e4410',
  greenDeep:   '#163a0b',
  greenTint:   '#e8f0e3',
  greenBorder: '#c2d9b4',

  // Palette
  white:       '#FFFFFF',
  pageBg:      '#FAF8F5',      // Soft Linen tint — warm page background
  linen:       '#F5F1EA',      // Soft Linen — panels / cards
  linenDark:   '#EDE8DF',      // borders / dividers

  // Onyx typography scale
  ink:         '#191B19',      // Onyx Black — headings
  inkMid:      '#3d403d',      // body text
  inkLight:    '#5a5d5a',      // secondary text
  inkMuted:    '#7a7d7a',      // captions / labels

  // Semantic — keep red for sale/error (universal)
  saleRed:     '#C0392B',
  salePink:    '#FEF2F2',

  // Gold Harvest — accent / star rating / savings
  starGold:    '#EC9C00',      // replaces F59E0B — uses ZOVA Gold Harvest
  goldLight:   '#fef6e0',
  goldDark:    '#b87800',
  goldBorder:  '#f5d06e',

  // Structural
  line:        '#EDE8DF',      // Linen Dark — all borders / dividers
  softBg:      '#F5F1EA',      // Soft Linen — skeleton / hover bg

  // Shadows — Onyx-tinted
  shadow:      '0 2px 16px rgba(25,27,25,0.06)',
  shadowMd:    '0 8px 32px rgba(25,27,25,0.10)',
  shadowLg:    '0 24px 56px rgba(25,27,25,0.14)',
};
// ─────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=Nunito:wght@400;500;600;700;800&display=swap');

  .pdp-root * { box-sizing: border-box; }
  .pdp-root { font-family: 'Nunito', sans-serif; }
  .pdp-heading { font-family: 'Fraunces', Georgia, serif; }

  .pdp-img-zoom { transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
  .pdp-img-zoom:hover { transform: scale(1.04); }

  .pdp-thumb { transition: all 0.18s ease; cursor: pointer; border-radius: 10px; overflow: hidden; }
  .pdp-thumb:hover { opacity: 1 !important; }

  .pdp-pill-btn { transition: all 0.15s ease; cursor: pointer; }
  .pdp-pill-btn:hover { transform: translateY(-1px); }

  .pdp-add-btn { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .pdp-add-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(46,100,23,0.30); }
  .pdp-add-btn:not(:disabled):active { transform: translateY(0); }

  .pdp-tab-btn { transition: color 0.15s, border-color 0.15s; }
  .pdp-tab-btn:hover { color: ${T.ink} !important; }

  .pdp-promo-shine {
    position: relative; overflow: hidden;
  }
  .pdp-promo-shine::after {
    content: ''; position: absolute;
    top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    animation: promoShine 3s ease-in-out infinite;
  }
  @keyframes promoShine {
    0% { left: -100%; }
    50% { left: 140%; }
    100% { left: 140%; }
  }

  .pdp-fade-in { animation: fadein 0.4s ease forwards; }
  @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

  .pdp-wishlist-btn { transition: all 0.2s ease; }
  .pdp-wishlist-btn:hover { transform: scale(1.12); }
  .pdp-wishlist-btn.active { animation: heartpop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes heartpop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }

  .pdp-qty-btn { transition: background 0.15s, color 0.15s; }
  .pdp-qty-btn:not(:disabled):hover { background: ${T.softBg} !important; }

  .pdp-spec-row:hover { background: ${T.linen}; }

  .pdp-thumb-rail { scroll-snap-type: x mandatory; }
  .pdp-thumb-rail > * { scroll-snap-align: start; }
`;

// ─────────────────────────────────────────────────────────────
// RESPONSIVE HOOK
// ─────────────────────────────────────────────────────────────
function useIsDesktop(bp = 1024) {
  const [v, set] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${bp}px)`);
    set(mq.matches);
    const h = e => set(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [bp]);
  return v;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function buildGalleryMedia(product) {
  const imgs = (product?.image_urls || []).filter(Boolean).map((url, i) => ({ id: `img-${i}`, type: 'image', url }));
  const vids = (product?.video_urls || []).filter(Boolean).map((url, i) => ({ id: `vid-${i}`, type: 'video', url }));
  return [...imgs, ...vids];
}
function getUniqueOptions(variants, key) {
  return [...new Set((variants || []).map(v => v?.[key]).filter(Boolean))];
}
function pickDefaultVariant(variants) {
  return variants?.find(v => Number(v.stock_quantity) > 0) || variants?.[0] || null;
}
function formatSpecKey(k) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function formatSpecValue(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) {
    if (!v.length) return null;
    const parts = v.map(item => {
      if (item && typeof item === 'object') {
        if (item.type && item.percent !== undefined) return `${item.type} ${item.percent}%`;
        return Object.values(item).filter(x => x !== null && x !== undefined && x !== '').join(' ');
      }
      return String(item);
    }).filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }
  if (typeof v === 'object') {
    const parts = Object.entries(v).map(([sk, sv]) => {
      const fv = formatSpecValue(sv);
      return fv ? `${formatSpecKey(sk)}: ${fv}` : null;
    }).filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  }
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  const str = String(v).trim();
  if (!str) return null;
  if (/^[a-z][a-z0-9_]*$/.test(str)) return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return str;
}
function getSpecificationEntries(specs) {
  if (!specs) return [];
  if (typeof specs === 'string') return specs.split('\n').map((v, i) => ({ key: `Detail ${i+1}`, value: v.trim() })).filter(r => r.value);
  if (Array.isArray(specs)) return specs.map((e, i) => {
    if (!e) return null;
    if (typeof e === 'object') { const k = String(e.key||`Detail ${i+1}`).trim(), v = String(e.value||'').trim(); return v ? { key:k, value:v } : null; }
    const v = String(e).trim(); return v ? { key:`Detail ${i+1}`, value:v } : null;
  }).filter(Boolean);
  if (typeof specs === 'object') return Object.entries(specs).map(([k, v]) => {
    const value = formatSpecValue(v);
    return value ? { key: formatSpecKey(k), value } : null;
  }).filter(Boolean);
  return [];
}

// ─────────────────────────────────────────────────────────────
// PROMOTION BANNER
// ─────────────────────────────────────────────────────────────
function PromotionBanner({ promotions, productPrice }) {
  if (!promotions?.length) return null;
  const zova     = promotions.find(p => p.owner_type === 'zova')   || null;
  const seller   = promotions.find(p => p.owner_type === 'seller') || null;
  const primary  = zova || seller;
  const secondary = zova && seller ? seller : null;
  if (!primary) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PromoBannerRow promo={primary}   price={productPrice} />
      {secondary && <PromoBannerRow promo={secondary} price={productPrice} secondary />}
    </div>
  );
}

function PromoBannerRow({ promo, price, secondary = false }) {
  const savings = computeSavingsLabel(promo, price);
  const bg    = promo.badge_bg_color   || (secondary ? '#2a3a28' : T.greenDeep);
  const fg    = promo.badge_text_color || T.white;
  const tagBg = promo.tag_bg_color     || T.starGold;   // Gold Harvest as default tag colour
  const tagFg = promo.tag_text_color   || T.ink;

  return (
    <div className="pdp-promo-shine" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px', borderRadius: 14,
      background: bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
        <FiTag size={13} style={{ color: fg, opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: fg, letterSpacing: '0.02em' }}>
          {promo.display_name}
        </span>
        {promo.display_tag && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: tagFg,
            background: tagBg, padding: '3px 10px', borderRadius: 100,
          }}>
            {promo.display_tag}
          </span>
        )}
        {promo.owner_type === 'seller' && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: fg, opacity: 0.6,
            background: 'rgba(255,255,255,0.12)', padding: '2px 7px', borderRadius: 100,
          }}>Store offer</span>
        )}
      </div>
      {/* Savings pill — Gold Harvest */}
      {savings && (
        <span style={{
          fontSize: 12, fontWeight: 900,
          color: T.goldDark,
          background: T.goldLight,
          border: `1px solid ${T.goldBorder}`,
          padding: '5px 12px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {savings}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMAGE GALLERY
// ─────────────────────────────────────────────────────────────
function ImageGallery({ media, productName, isDesktop }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed]     = useState(false);
  const imgRef = useRef(null);

  const all = media?.length ? media : [{ id: 'fallback', type: 'image', url: 'https://placehold.co/600x800/F5F1EA/7a7d7a?text=No+Image' }];
  const cur = all[selected] || all[0];
  const canZoom = cur?.type !== 'video';

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const k = e => {
      if (e.key === 'Escape')     setLightbox(false);
      if (e.key === 'ArrowRight') setSelected(s => (s+1) % all.length);
      if (e.key === 'ArrowLeft')  setSelected(s => (s-1+all.length) % all.length);
    };
    window.addEventListener('keydown', k);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', k); };
  }, [lightbox, all.length]);

  const handleMouseMove = e => {
    if (!imgRef.current || !canZoom) return;
    const r = imgRef.current.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const goPrev = () => setSelected(s => (s-1+all.length) % all.length);
  const goNext = () => setSelected(s => (s+1) % all.length);

  const Thumbs = ({ vertical }) => (
    <div className={!vertical ? 'pdp-thumb-rail' : ''} style={{
      display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 8,
      ...(vertical
        ? { maxHeight: 520, overflowY: 'auto', width: 72, flexShrink: 0 }
        : { overflowX: 'auto', paddingBottom: 2, marginTop: 10 }),
    }}>
      {all.map((item, i) => (
        <button key={item.id} type="button" onClick={() => setSelected(i)} className="pdp-thumb"
          style={{
            width: vertical ? 72 : 58, height: vertical ? 88 : 72,
            flexShrink: 0, padding: 0,
            border: `2px solid ${i === selected ? T.green : 'transparent'}`,
            opacity: i === selected ? 1 : 0.5,
            background: T.softBg,
            boxShadow: i === selected ? `0 0 0 3px ${T.greenTint}` : 'none',
          }}
        >
          {item.type === 'video'
            ? <div style={{ width:'100%',height:'100%',background:T.ink,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:900,color:T.white,letterSpacing:'0.08em' }}>VIDEO</div>
            : <img src={item.url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          }
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: 12, position: isDesktop ? 'sticky' : 'static', top: 24 }}>
        {isDesktop && all.length > 1 && <Thumbs vertical />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={imgRef}
            onMouseEnter={() => { if (canZoom) setZoomed(true); }}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMouseMove}
            style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden',
              aspectRatio: '3/4', background: T.softBg,
              cursor: canZoom ? 'zoom-in' : 'default',
              boxShadow: T.shadow,
            }}
          >
            {cur?.type === 'video'
              ? <video src={cur.url} controls playsInline style={{ width:'100%',height:'100%',objectFit:'cover',background:'#000' }} />
              : <img src={cur?.url} alt={productName} style={{
                  width:'100%',height:'100%',objectFit:'cover',
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: zoomed ? 'scale(1.55)' : 'scale(1)',
                  transition: zoomed ? 'transform 0.12s ease-out' : 'transform 0.4s ease-out',
                  userSelect: 'none',
                }} />
            }

            {canZoom && (
              <button type="button" onClick={() => setLightbox(true)} style={{
                position:'absolute',bottom:12,right:12,
                background:'rgba(255,255,255,0.92)',
                border:`1px solid ${T.linenDark}`,borderRadius:10,
                padding:'7px 10px',cursor:'pointer',
                display:'flex',alignItems:'center',gap:5,
                backdropFilter:'blur(6px)',boxShadow:T.shadow,
              }}>
                <FiZoomIn size={12} style={{ color:T.inkMid }} />
                <span style={{ fontSize:10,fontWeight:800,color:T.inkMid,letterSpacing:'0.06em' }}>EXPAND</span>
              </button>
            )}

            {all.length > 1 && !zoomed && (
              <>
                <button type="button" onClick={e => { e.stopPropagation(); goPrev(); }}
                  style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:38,height:38,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.88)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(25,27,25,0.12)',backdropFilter:'blur(4px)',fontSize:18,color:T.ink }}>‹</button>
                <button type="button" onClick={e => { e.stopPropagation(); goNext(); }}
                  style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:38,height:38,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.88)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(25,27,25,0.12)',backdropFilter:'blur(4px)',fontSize:18,color:T.ink }}>›</button>
              </>
            )}

            {all.length > 1 && (
              <div style={{ position:'absolute',bottom:14,left:0,right:0,display:'flex',justifyContent:'center',gap:5 }}>
                {all.map((_,i) => (
                  <button key={i} type="button" onClick={() => setSelected(i)} style={{
                    width: i === selected ? 18 : 6, height:6, borderRadius:3,
                    background: i === selected ? T.green : 'rgba(255,255,255,0.6)',
                    border:'none', cursor:'pointer', padding:0, transition:'all 0.2s ease',
                  }} />
                ))}
              </div>
            )}
          </div>
          {!isDesktop && all.length > 1 && <Thumbs vertical={false} />}
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position:'fixed',inset:0,zIndex:200,
          background:'rgba(25,27,25,0.96)',     // Onyx Black tint
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%',maxWidth:900,position:'relative' }}>
            <button type="button" onClick={() => setLightbox(false)} style={{
              position:'absolute',top:-48,right:0,width:40,height:40,borderRadius:'50%',border:'none',
              background:'rgba(255,255,255,0.12)',color:T.white,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',
            }}><FiX size={18} /></button>
            <div style={{ position:'absolute',top:-48,left:0,fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.5)' }}>
              {selected+1} / {all.length}
            </div>
            <div style={{ borderRadius:20,overflow:'hidden',background:'#111',aspectRatio:'3/4',maxHeight:'75vh',display:'flex',alignItems:'center',justifyContent:'center' }}>
              {cur?.type === 'video'
                ? <video src={cur.url} controls autoPlay playsInline style={{ width:'100%',height:'100%',objectFit:'contain',background:'#000' }} />
                : <img src={cur?.url} alt={productName} style={{ width:'100%',height:'100%',objectFit:'contain' }} />
              }
            </div>
            {all.length > 1 && (
              <>
                <button type="button" onClick={goPrev} style={{ position:'absolute',left:-20,top:'50%',transform:'translateY(-50%)',width:44,height:44,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.1)',color:T.white,cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center' }}>‹</button>
                <button type="button" onClick={goNext} style={{ position:'absolute',right:-20,top:'50%',transform:'translateY(-50%)',width:44,height:44,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.1)',color:T.white,cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center' }}>›</button>
              </>
            )}
            {all.length > 1 && (
              <div style={{ display:'flex',gap:8,marginTop:16,justifyContent:'center',overflowX:'auto' }}>
                {all.map((item,i) => (
                  <button key={item.id} type="button" onClick={() => setSelected(i)} style={{
                    width:58,height:70,flexShrink:0,borderRadius:8,overflow:'hidden',padding:0,cursor:'pointer',
                    border:`2px solid ${i === selected ? T.green : 'rgba(255,255,255,0.2)'}`,
                    background:'#111',transition:'border-color 0.15s',
                  }}>
                    {item.type==='video'
                      ? <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:T.white,fontSize:9,fontWeight:900 }}>VIDEO</div>
                      : <img src={item.url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// OPTION PILLS
// ─────────────────────────────────────────────────────────────
function OptionPills({ label, options, selected, onSelect, getAvailable }) {
  if (!options.length) return null;
  return (
    <div>
      <div style={{ display:'flex',alignItems:'baseline',gap:8,marginBottom:10 }}>
        <span style={{ fontSize:11,fontWeight:800,color:T.inkMid,textTransform:'uppercase',letterSpacing:'0.1em' }}>{label}</span>
        {selected && <span style={{ fontSize:13,fontWeight:600,color:T.ink }}>— {selected}</span>}
      </div>
      <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
        {options.map(opt => {
          const isSel = opt === selected;
          const avail = getAvailable ? getAvailable(opt) : true;
          return (
            <button key={opt} type="button" onClick={() => avail && onSelect(opt)} className="pdp-pill-btn"
              style={{
                padding:'9px 18px',borderRadius:10,fontSize:13,fontWeight:700,
                border:`2px solid ${isSel ? T.ink : avail ? T.line : T.line}`,
                background: isSel ? T.ink : T.white,
                color: isSel ? T.white : avail ? T.ink : T.inkMuted,
                cursor: avail ? 'pointer' : 'not-allowed',
                opacity: avail ? 1 : 0.4,
                textDecoration: avail ? 'none' : 'line-through',
                boxShadow: isSel ? `0 4px 12px rgba(25,27,25,0.15)` : 'none',
              }}
            >
              {opt}{isSel && <FiCheck size={10} style={{ marginLeft:5,verticalAlign:'middle' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUANTITY STEPPER
// ─────────────────────────────────────────────────────────────
function QuantityStepper({ quantity, setQuantity, max }) {
  return (
    <div style={{ display:'flex',alignItems:'center',border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,overflow:'hidden',height:50,width:'fit-content' }}>
      <button type="button" onClick={() => setQuantity(q => Math.max(1,q-1))} disabled={quantity <= 1} className="pdp-qty-btn"
        style={{ width:46,height:'100%',border:'none',background:'none',cursor:quantity<=1?'not-allowed':'pointer',color:quantity<=1?T.inkMuted:T.ink,display:'flex',alignItems:'center',justifyContent:'center',borderRight:`1px solid ${T.line}` }}
      ><FiMinus size={14} /></button>
      <span style={{ minWidth:48,textAlign:'center',fontSize:15,fontWeight:800,color:T.ink,letterSpacing:'-0.02em' }}>{quantity}</span>
      <button type="button" onClick={() => setQuantity(q => q < max ? q+1 : q)} disabled={quantity >= max} className="pdp-qty-btn"
        style={{ width:46,height:'100%',border:'none',background:'none',cursor:quantity>=max?'not-allowed':'pointer',color:quantity>=max?T.inkMuted:T.ink,display:'flex',alignItems:'center',justifyContent:'center',borderLeft:`1px solid ${T.line}` }}
      ><FiPlus size={14} /></button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAR ROW — Gold Harvest
// ─────────────────────────────────────────────────────────────
function StarRow({ rating, count }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
      <div style={{ display:'flex',gap:2 }}>
        {[1,2,3,4,5].map(s => (
          <FiStar key={s} size={12} style={{
            color: s<=Math.round(rating) ? T.starGold : T.line,
            fill:  s<=Math.round(rating) ? T.starGold : 'none',
          }} />
        ))}
      </div>
      <span style={{ fontSize:13,fontWeight:700,color:T.ink }}>{Number(rating||5).toFixed(1)}</span>
      {count !== undefined && <span style={{ fontSize:12,color:T.inkMuted }}>({count})</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SPECIFICATIONS
// ─────────────────────────────────────────────────────────────
function SpecificationsPanel({ entries }) {
  if (!entries.length) return <p style={{ color:T.inkMuted,fontStyle:'italic',fontSize:14,margin:0 }}>No specifications available.</p>;
  return (
    <div style={{ maxWidth:600 }}>
      {entries.map((e,i) => (
        <div key={`${e.key}-${i}`} className="pdp-spec-row" style={{
          display:'grid',gridTemplateColumns:'160px 1fr',gap:16,
          padding:'14px 10px',borderRadius:8,
          borderBottom: i < entries.length-1 ? `1px solid ${T.line}` : 'none',
          transition:'background 0.12s',
        }}>
          <span style={{ fontSize:13,fontWeight:700,color:T.ink }}>{e.key}</span>
          <span style={{ fontSize:13,color:T.inkLight,lineHeight:1.65 }}>{e.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────
function ReviewsPanel({ product, user, onReviewAdded, isDesktop }) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [hovStar, setHovStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [ok, setOk]           = useState(false);
  const [focused, setFocused] = useState(false);
  const reviews = product.reviews || [];

  const submit = async e => {
    e.preventDefault();
    if (!comment.trim()) { setErr('Please enter a comment.'); return; }
    setLoading(true); setErr(''); setOk(false);
    try {
      const res  = await fetch('/api/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ productId:product.id, rating, comment }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      onReviewAdded({ id:data.id||Date.now(), rating, comment, created_at:new Date().toISOString() });
      setComment(''); setRating(5); setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'grid',gap:32 }} className={isDesktop ? 'lg:grid-cols-[1fr_340px]' : ''}>
      <div>
        {reviews.length === 0 ? (
          <div style={{ textAlign:'center',padding:'48px 24px',background:T.linen,borderRadius:20,border:`1.5px dashed ${T.line}` }}>
            <div style={{ fontSize:36,marginBottom:12 }}>✍️</div>
            <p style={{ fontWeight:800,fontSize:16,color:T.ink,margin:'0 0 6px' }}>No reviews yet</p>
            <p style={{ fontSize:13,color:T.inkMuted,margin:0 }}>Be the first to share your thoughts</p>
          </div>
        ) : (
          <div>
            {reviews.map((rev,i) => (
              <div key={rev.id} style={{ paddingTop:i?20:0,paddingBottom:20,borderBottom:i<reviews.length-1?`1px solid ${T.line}`:'none' }} className="pdp-fade-in">
                <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',background:T.greenTint,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>👤</div>
                  <div>
                    <StarRow rating={rev.rating} />
                    <span style={{ fontSize:11,color:T.inkMuted,marginTop:2,display:'block' }}>
                      {new Date(rev.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize:14,color:T.inkLight,lineHeight:1.75,margin:0 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:T.linen,borderRadius:20,padding:24,border:`1px solid ${T.line}`,alignSelf:'start' }}>
        <p style={{ fontSize:14,fontWeight:800,color:T.ink,margin:'0 0 18px' }}>Write a Review</p>
        {!user ? (
          <div style={{ textAlign:'center',padding:'16px 0' }}>
            <p style={{ fontSize:13,color:T.inkMuted,marginBottom:16 }}>Sign in to leave a review</p>
            <Link href="/login" style={{ display:'inline-block',padding:'10px 24px',borderRadius:10,background:T.green,color:T.white,textDecoration:'none',fontSize:13,fontWeight:700 }}>Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:800,color:T.inkMid,textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 8px' }}>Rating</p>
              <div style={{ display:'flex',gap:4 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onMouseEnter={() => setHovStar(s)} onMouseLeave={() => setHovStar(0)} onClick={() => setRating(s)} style={{ background:'none',border:'none',cursor:'pointer',padding:2 }}>
                    <FiStar size={26} style={{ color:s<=(hovStar||rating)?T.starGold:T.line,fill:s<=(hovStar||rating)?T.starGold:'none',transition:'all 0.1s' }} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:800,color:T.inkMid,textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 8px' }}>Your Review</p>
              <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="What did you think of this product?"
                style={{ width:'100%',padding:'10px 12px',borderRadius:10,resize:'vertical',border:`1.5px solid ${focused?T.green:T.line}`,background:T.white,fontSize:13,color:T.ink,outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color 0.15s' }} />
            </div>
            {err && <p style={{ fontSize:12,color:T.saleRed,background:T.salePink,padding:'8px 12px',borderRadius:8,margin:0 }}>{err}</p>}
            {ok  && <p style={{ fontSize:12,color:T.green,background:T.greenTint,padding:'8px 12px',borderRadius:8,margin:0,fontWeight:600 }}>✓ Review submitted!</p>}
            <button type="submit" disabled={loading} style={{
              padding:'12px 0',borderRadius:10,border:'none',
              background:T.green,color:T.white,           // Forest Green CTA
              fontSize:13,fontWeight:700,
              cursor:loading?'wait':'pointer',opacity:loading?0.7:1,
              transition:'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.greenDark; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.green; }}
            >{loading ? 'Submitting…' : 'Submit Review'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RETURN POLICY
// ─────────────────────────────────────────────────────────────
function ReturnPolicyPanel({ policy }) {
  const rows = Array.isArray(policy?.rows) && policy.rows.length ? policy.rows : DEFAULT_RETURN_POLICY.rows;
  return (
    <div style={{ display:'grid',gap:20 }}>
      <div>
        <p style={{ fontSize:20,fontWeight:900,color:T.ink,margin:'0 0 6px',fontFamily:"'Fraunces', Georgia, serif" }}>
          {policy?.title || DEFAULT_RETURN_POLICY.title}
        </p>
        <p style={{ fontSize:14,color:T.inkLight,lineHeight:1.75,margin:0 }}>{policy?.subtitle || DEFAULT_RETURN_POLICY.subtitle}</p>
      </div>
      <div style={{ overflowX:'auto',border:`1px solid ${T.line}`,borderRadius:16 }}>
        <table style={{ width:'100%',borderCollapse:'collapse',minWidth:680 }}>
          <thead>
            <tr style={{ background:T.linen }}>
              {['Scenario','Window','Condition','Resolution','Notes'].map(h => (
                <th key={h} style={{ padding:'13px 16px',borderBottom:`1px solid ${T.line}`,textAlign:'left',fontSize:11,fontWeight:800,color:T.ink,textTransform:'uppercase',letterSpacing:'0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row,i) => (
              <tr key={row.id||i} style={{ background:i%2?T.pageBg:T.white }}>
                {['scenario','window','condition','resolution','notes'].map((f,fi) => (
                  <td key={f} style={{ padding:'13px 16px',borderBottom:`1px solid ${T.line}`,fontSize:13,lineHeight:1.65,color:f==='resolution'?T.greenDeep:fi===0?T.ink:T.inkLight,fontWeight:f==='resolution'||fi===0?700:400 }}>{row[f]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex',alignItems:'flex-start',gap:14,padding:18,border:`1px solid ${T.line}`,borderRadius:14,background:T.linen }}>
        <div style={{ width:36,height:36,borderRadius:10,background:T.greenTint,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <FiShield size={16} style={{ color:T.green }} />
        </div>
        <div>
          <p style={{ fontSize:13,fontWeight:800,color:T.ink,margin:'0 0 4px' }}>Need help with a return?</p>
          <p style={{ fontSize:13,color:T.inkLight,margin:0,lineHeight:1.65 }}>
            {policy?.support_text || DEFAULT_RETURN_POLICY.support_text}{' '}
            <Link href="/support" style={{ color:T.green,fontWeight:700,textDecoration:'none' }}>Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id:'overview',  label:'Overview'           },
  { id:'specs',     label:'Specifications'     },
  { id:'reviews',   label:'Reviews'            },
  { id:'policies',  label:'Returns & Delivery' },
];

function TabBar({ active, setActive, reviewCount }) {
  return (
    <div style={{ display:'flex',borderBottom:`1px solid ${T.line}`,overflowX:'auto',gap:0 }}>
      {TABS.map(({ id, label }) => {
        const lbl = id==='reviews' ? `Reviews (${reviewCount})` : label;
        const act = active === id;
        return (
          <button key={id} type="button" onClick={() => setActive(id)} className="pdp-tab-btn"
            style={{
              padding:'16px 24px',fontSize:13,fontWeight:700,whiteSpace:'nowrap',
              border:'none',background:'none',cursor:'pointer',
              color: act ? T.ink : T.inkMuted,
              borderBottom:`2.5px solid ${act ? T.green : 'transparent'}`, // Forest underline
              marginBottom:-1,
            }}>{lbl}</button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW PANEL
// ─────────────────────────────────────────────────────────────
function OverviewPanel({ product, storeName, specEntries, returnPolicy, selectedVariantLabel }) {
  return (
    <div style={{ display:'grid',gap:24 }}>
      <p style={{ fontSize:15,color:T.inkLight,lineHeight:1.85,margin:0,whiteSpace:'pre-wrap' }}>
        {product.description || 'No description available.'}
      </p>
      <div style={{ display:'grid',gap:12 }} className="sm:grid-cols-2">
        <div style={{ border:`1px solid ${T.line}`,borderRadius:16,padding:18,background:T.linen }}>
          <p style={{ margin:'0 0 12px',fontSize:11,fontWeight:800,color:T.ink,textTransform:'uppercase',letterSpacing:'0.1em' }}>Purchase details</p>
          {[
            ['Seller', storeName],
            ['Free delivery', 'Orders over ₦50,000'],
            ['Returns', returnPolicy?.rows?.[0]?.window || '30-day policy'],
            selectedVariantLabel ? ['Selected', selectedVariantLabel] : null,
          ].filter(Boolean).map(([k,v]) => (
            <div key={k} style={{ display:'flex',justifyContent:'space-between',gap:12,fontSize:13,marginBottom:9,paddingBottom:9,borderBottom:`1px solid ${T.line}` }}>
              <span style={{ color:T.inkLight,fontWeight:500 }}>{k}</span>
              <span style={{ color:T.ink,fontWeight:700,textAlign:'right' }}>{v}</span>
            </div>
          ))}
        </div>
        {specEntries.length > 0 && (
          <div style={{ border:`1px solid ${T.line}`,borderRadius:16,padding:18,background:T.white }}>
            <p style={{ margin:'0 0 12px',fontSize:11,fontWeight:800,color:T.ink,textTransform:'uppercase',letterSpacing:'0.1em' }}>Key specs</p>
            {specEntries.slice(0,5).map(e => (
              <div key={`${e.key}-${e.value}`} style={{ display:'grid',gridTemplateColumns:'120px 1fr',gap:10,marginBottom:9,paddingBottom:9,borderBottom:`1px solid ${T.line}` }}>
                <span style={{ fontSize:12,fontWeight:700,color:T.ink }}>{e.key}</span>
                <span style={{ fontSize:12,color:T.inkLight }}>{e.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION RENDERER
// ─────────────────────────────────────────────────────────────
function SectionContent({ id, product, user, onReviewAdded, storeName, specEntries, returnPolicy, selectedVariantLabel, isDesktop }) {
  if (id === 'overview') return <OverviewPanel product={product} storeName={storeName} specEntries={specEntries} returnPolicy={returnPolicy} selectedVariantLabel={selectedVariantLabel} />;
  if (id === 'specs')    return <SpecificationsPanel entries={specEntries} />;
  if (id === 'reviews')  return <ReviewsPanel product={product} user={user} onReviewAdded={onReviewAdded} isDesktop={isDesktop} />;
  if (id === 'policies') return <ReturnPolicyPanel policy={returnPolicy} />;
  return null;
}

// ─────────────────────────────────────────────────────────────
// MOBILE ACCORDION
// ─────────────────────────────────────────────────────────────
function MobileSection({ id, title, open, onToggle, children }) {
  return (
    <section id={id} style={{ border:`1px solid ${T.line}`,borderRadius:18,background:T.white,overflow:'hidden' }}>
      <button type="button" onClick={onToggle} style={{
        width:'100%',border:'none',background:'none',cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        gap:16,padding:'18px 18px',
      }}>
        <span style={{ fontSize:13,fontWeight:800,color:T.ink }}>{title}</span>
        <FiChevronDown size={15} style={{ color:T.inkMid,transform:open?'rotate(180deg)':'none',transition:'transform 0.18s',flexShrink:0 }} />
      </button>
      {open && <div style={{ padding:'0 18px 20px' }} className="pdp-fade-in">{children}</div>}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TRUST STRIP — Zova Forest icons
// ─────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',border:`1px solid ${T.line}`,borderRadius:14,overflow:'hidden',background:T.linen }}>
      {[
        { icon:FiTruck,     label:'Free delivery', value:'Over ₦50k' },
        { icon:FiRefreshCw, label:'Easy returns',  value:'30 days'   },
        { icon:FiShield,    label:'Secure payment',value:'Protected'  },
      ].map(({ icon:Icon, label, value }, i) => (
        <div key={label} style={{ padding:'14px 10px',textAlign:'center',borderLeft:i>0?`1px solid ${T.line}`:'none' }}>
          <Icon size={16} style={{ color:T.green,display:'block',margin:'0 auto 6px' }} />
          <p style={{ margin:'0 0 2px',fontSize:11,fontWeight:700,color:T.ink }}>{value}</p>
          <p style={{ margin:0,fontSize:10,color:T.inkMuted }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct]           = useState(null);
  const [returnPolicy, setReturnPolicy] = useState(DEFAULT_RETURN_POLICY);
  const [variants, setVariants]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedSize, setSelectedSize]     = useState(null);
  const [selectedColor, setSelectedColor]   = useState(null);
  const [quantity, setQuantity]         = useState(1);
  const [activeTab, setActiveTab]       = useState('overview');
  const [openSection, setOpenSection]   = useState('overview');
  const [user, setUser]                 = useState(null);
  const [toast, setToast]               = useState('');
  const [addedAnim, setAddedAnim]       = useState(false);

  const { slug } = React.use(params);
  const supabase  = createClient();
  const isDesktop = useIsDesktop();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{session} }) => setUser(session?.user || null));
    const { data:{subscription} } = supabase.auth.onAuthStateChange((_,s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [pRes, vRes] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache:'no-store' }),
          fetch(`/api/products/${slug}/variants`, { cache:'no-store' }),
        ]);
        const pData = await pRes.json();
        const vData = await vRes.json();
        if (!pRes.ok) throw new Error(pData.error);
        const fetchedVariants = Array.isArray(vData?.variants) ? vData.variants : [];
        setProduct(pData);
        setReturnPolicy(pData.return_policy || DEFAULT_RETURN_POLICY);
        setVariants(fetchedVariants);

        if (!hasLoggedView.current) {
          hasLoggedView.current = true;
          logProductEvent({ productId:pData.id, eventType:'view', source:'product_page', metadata:{ referrer:document.referrer||null } });
        }
        try {
          const views = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
          localStorage.setItem('recently_viewed_products', JSON.stringify([pData.id, ...views.filter(id => id !== pData.id)].slice(0,15)));
        } catch {}

        const def = pickDefaultVariant(fetchedVariants);
        if (def) { setSelectedSize(def.size||null); setSelectedColor(def.color||null); }
        else { setSelectedSize(pData.sizes?.[0]||null); setSelectedColor(pData.colors?.[0]||null); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  useEffect(() => { if (typeof window !== 'undefined' && slug) window.scrollTo({top:0,behavior:'auto'}); }, [slug]);

  const sizeOptions  = useMemo(() => { const f=getUniqueOptions(variants,'size'); return f.length?f:(Array.isArray(product?.sizes)?product.sizes:[]); }, [variants, product]);
  const colorOptions = useMemo(() => { const f=getUniqueOptions(variants,'color'); return f.length?f:(Array.isArray(product?.colors)?product.colors:[]); }, [variants, product]);
  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(v => { const sm=sizeOptions.length?v.size===selectedSize:true; const cm=colorOptions.length?v.color===selectedColor:true; return sm&&cm; }) || null;
  }, [variants, sizeOptions.length, colorOptions.length, selectedSize, selectedColor]);

  const effectiveStock       = selectedVariant ? Number(selectedVariant.stock_quantity)||0 : Number(product?.stock_quantity)||0;
  const selectedVariantLabel = [selectedVariant?.color||selectedColor, selectedVariant?.size||selectedSize].filter(Boolean).join(' / ');
  const requiresVariant      = variants.length > 0;
  const canAddToCart         = requiresVariant ? Boolean(selectedVariant) && effectiveStock > 0 : effectiveStock > 0;
  const galleryMedia         = useMemo(() => buildGalleryMedia(product), [product]);
  const specEntries          = useMemo(() => getSpecificationEntries(product?.specifications), [product?.specifications]);
  const pricingProduct       = useMemo(() => selectedVariant ? { ...product, price:selectedVariant.price??product?.price } : product, [product, selectedVariant]);
  const bulkPricing          = useMemo(() => calculateBulkPricing(pricingProduct, quantity), [pricingProduct, quantity]);
  const bulkTiers            = useMemo(() => getBulkDiscountTiers(product), [product]);
  const baseDiscPct          = product?.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : null;
  const currentPrice         = bulkPricing.finalUnitPrice;
  const compareAtPrice       = bulkPricing.hasBulkDiscount ? bulkPricing.baseUnitPrice : (product?.discount_price ? product.price : null);
  const activeDiscPct        = bulkPricing.hasBulkDiscount ? bulkPricing.appliedTier?.discount_percent : baseDiscPct;
  const inWishlist           = product ? isInWishlist(product.id) : false;
  const storeName            = product?.stores?.name || product?.store?.name || 'Trusted seller';
  const promotions           = Array.isArray(product?.promotions) ? product.promotions : [];

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); }, []);

  const handleShare = useCallback(async () => {
    const data = { title:product?.name, text:product?.description?.slice(0,100), url:window.location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { try { await navigator.clipboard.writeText(data.url); showToast('Link copied!'); } catch {} }
  }, [product, showToast]);

  const handleAddToCart = useCallback(() => {
    if (!canAddToCart) return;
    addToCart({ ...product, variant_id:selectedVariant?.id||null, stock_quantity:effectiveStock, selectedSize:selectedVariant?.size||selectedSize, selectedColor:selectedVariant?.color||selectedColor, quantity });
    setAddedAnim(true);
    showToast('Added to cart!');
    setTimeout(() => setAddedAnim(false), 1800);
  }, [canAddToCart, product, selectedVariant, effectiveStock, selectedSize, selectedColor, quantity, addToCart, showToast]);

  const handleReviewAdded = useCallback(rev => {
    setProduct(prev => ({ ...prev, reviews:[rev,...(prev.reviews||[])] }));
  }, []);

  const cartLabel = !canAddToCart ? (requiresVariant && !selectedVariant ? 'Select Options' : 'Out of Stock') : addedAnim ? '✓ Added!' : 'Add to Cart';
  const sectionProps = { product, user, onReviewAdded:handleReviewAdded, storeName, specEntries, returnPolicy, selectedVariantLabel, isDesktop };

  // ── LOADING ──
  if (loading) return (
    <div className="pdp-root" style={{ minHeight:'100vh',background:T.white,padding:'60px 24px' }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gap:48 }} className="lg:grid-cols-2">
        {[['100%'],['100%','60%','80%','40%']].map((widths,gi) => (
          <div key={gi} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {widths.map((w,i) => (
              <div key={i} className="animate-pulse" style={{
                width:w, aspectRatio:i===0&&gi===0?'3/4':undefined,
                height:i===0&&gi===0?undefined:24,
                borderRadius:i===0&&gi===0?20:8,
                background:T.softBg,
                animation:'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );

  if (!product) return (
    <div className="pdp-root" style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16 }}>
      <style>{GLOBAL_STYLES}</style>
      <p style={{ fontSize:18,fontWeight:800,color:T.ink }}>Product not found</p>
      <Link href="/shop" style={{ color:T.green,fontWeight:600,fontSize:14 }}>← Back to Shop</Link>
    </div>
  );

  return (
    <div className="pdp-root" style={{ minHeight:'100vh',background:T.white }}>
      <style>{GLOBAL_STYLES}</style>

      {/* TOAST — Onyx Black */}
      {toast && (
        <div style={{
          position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',zIndex:9999,
          background:T.ink,color:T.white,padding:'11px 22px',borderRadius:100,
          fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,
          boxShadow:T.shadowLg,whiteSpace:'nowrap',
        }} className="pdp-fade-in">
          <FiCheck size={13} style={{ color:T.starGold }} /> {toast}
        </div>
      )}

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'28px 16px 100px' }} className="lg:px-8 lg:pb-24 lg:pt-10">

        {/* BACK */}
        <div style={{ marginBottom:32 }}>
          <button onClick={() => router.back()} type="button"
            style={{
              display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:100,
              border:`1.5px solid ${T.line}`,background:T.white,color:T.inkMid,
              fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em',transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.green; e.currentTarget.style.color=T.green; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.line; e.currentTarget.style.color=T.inkMid; }}
          >
            <FiChevronLeft size={14} /> Back
          </button>
        </div>

        {/* MAIN GRID */}
        <div style={{ display:'grid',gap:40,alignItems:'start' }} className="lg:grid-cols-2 lg:gap-16">

          <ImageGallery media={galleryMedia} productName={product.name} isDesktop={isDesktop} />

          <div style={{ display:'flex',flexDirection:'column',gap:20 }} className="lg:sticky lg:top-8">

            {/* Category pill + rating */}
            <div style={{ display:'flex',alignItems:'center',flexWrap:'wrap',gap:10 }}>
              <span style={{
                fontSize:10,fontWeight:800,letterSpacing:'0.12em',textTransform:'uppercase',
                color:T.green,background:T.greenTint,border:`1px solid ${T.greenBorder}`,
                padding:'4px 12px',borderRadius:100,
              }}>{product.category?.name || 'Collection'}</span>
              <StarRow rating={product.rating} count={product.reviews_count||0} />
            </div>

            {/* Product name */}
            <div>
              <h1 className="pdp-heading" style={{
                fontSize:'clamp(1.8rem, 4.5vw, 2.6rem)', fontWeight:900, color:T.ink,
                margin:'0 0 6px', letterSpacing:'-0.04em', lineHeight:1.1,
              }}>{product.name}</h1>
              {product.sku && <p style={{ margin:0,fontSize:11,color:T.inkMuted,fontWeight:500 }}>SKU: {product.sku}</p>}
            </div>

            {/* Action icons */}
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <button type="button" onClick={() => toggleWishlist(product.id)}
                className={`pdp-wishlist-btn${inWishlist?' active':''}`}
                style={{ width:40,height:40,borderRadius:'50%',border:`1.5px solid ${inWishlist?'#FECACA':T.line}`,background:inWishlist?T.salePink:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
              ><FiHeart size={16} style={{ color:inWishlist?T.saleRed:T.inkMid,fill:inWishlist?T.saleRed:'none' }} /></button>

              <button type="button" onClick={handleShare}
                style={{ width:40,height:40,borderRadius:'50%',border:`1.5px solid ${T.line}`,background:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=T.ink}
                onMouseLeave={e => e.currentTarget.style.borderColor=T.line}
              ><FiShare2 size={15} style={{ color:T.inkMid }} /></button>

              <span style={{ marginLeft:'auto',fontSize:11,color:T.inkMuted,fontWeight:500 }}>
                Sold by{' '}
                <Link href={`/store/${product.stores?.slug||product.stores?.id}`}
                  style={{ color:T.ink,fontWeight:700,textDecoration:'none' }}
                  onMouseEnter={e => e.currentTarget.style.color=T.green}
                  onMouseLeave={e => e.currentTarget.style.color=T.ink}
                >{storeName}</Link>
              </span>
            </div>

            {/* PROMOTION BANNER */}
            {promotions.length > 0 && (
              <PromotionBanner promotions={promotions} productPrice={Number(product.price)} />
            )}

            {/* PRICE BLOCK — Soft Linen card */}
            <div style={{ padding:'20px',borderRadius:18,background:T.linen,border:`1px solid ${T.line}` }}>
              <div style={{ display:'flex',alignItems:'baseline',gap:12,flexWrap:'wrap',marginBottom:10 }}>
                <span className="pdp-heading" style={{ fontSize:36,fontWeight:900,color:T.ink,letterSpacing:'-0.04em',lineHeight:1 }}>
                  ₦{currentPrice?.toLocaleString('en-NG')}
                </span>
                {compareAtPrice && (
                  <>
                    <span style={{ fontSize:20,color:T.inkMuted,textDecoration:'line-through',fontWeight:400 }}>
                      ₦{compareAtPrice?.toLocaleString('en-NG')}
                    </span>
                    <span style={{ fontSize:12,fontWeight:800,color:T.saleRed,background:T.salePink,padding:'3px 9px',borderRadius:6 }}>
                      -{activeDiscPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Bulk discount — Forest tint */}
              {bulkPricing.hasBulkDiscount && (
                <div style={{ padding:'9px 12px',borderRadius:10,background:T.greenTint,border:`1px solid ${T.greenBorder}`,marginBottom:10 }}>
                  <p style={{ margin:'0 0 3px',fontSize:12,fontWeight:800,color:T.greenDeep }}>
                    {bulkPricing.appliedTier.discount_percent}% bulk discount — {bulkPricing.appliedTier.minimum_quantity}+ units
                  </p>
                  <p style={{ margin:0,fontSize:11,color:T.greenDeep }}>You save ₦{bulkPricing.totalSavings.toLocaleString()} at qty {quantity}</p>
                </div>
              )}

              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13,color:T.inkLight }}>
                <span>Line total ({quantity} item{quantity>1?'s':''})</span>
                <span style={{ fontWeight:800,color:T.ink }}>₦{bulkPricing.lineTotal.toLocaleString('en-NG')}</span>
              </div>
            </div>

            {/* SIZE + COLOR */}
            <div style={{ display:'flex',flexDirection:'column',gap:18 }}>
              <OptionPills
                label="Size" options={sizeOptions} selected={selectedSize} onSelect={setSelectedSize}
                getAvailable={sz => !variants.length || variants.some(v => v.size===sz && (!selectedColor||v.color===selectedColor) && Number(v.stock_quantity)>0)}
              />
              <OptionPills
                label="Color" options={colorOptions} selected={selectedColor} onSelect={setSelectedColor}
                getAvailable={cl => !variants.length || variants.some(v => v.color===cl && (!selectedSize||v.size===selectedSize) && Number(v.stock_quantity)>0)}
              />
            </div>

            {/* STOCK INDICATOR */}
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{
                width:8,height:8,borderRadius:'50%',flexShrink:0,
                background: effectiveStock>10 ? T.green : effectiveStock>0 ? T.starGold : T.saleRed,
              }} />
              <span style={{ fontSize:12,fontWeight:600,color: effectiveStock>10?T.green:effectiveStock>0?T.goldDark:T.saleRed }}>
                {effectiveStock>10 ? 'In Stock' : effectiveStock>0 ? `Only ${effectiveStock} left` : 'Out of Stock'}
              </span>
              {selectedVariantLabel && (
                <span style={{ marginLeft:'auto',fontSize:12,color:T.inkMuted,background:T.softBg,padding:'3px 10px',borderRadius:100 }}>
                  {selectedVariantLabel}
                </span>
              )}
            </div>

            {requiresVariant && !selectedVariant && (
              <div style={{ padding:'10px 14px',borderRadius:12,background:T.salePink,border:`1px solid #FECACA` }}>
                <p style={{ margin:0,fontSize:12,color:T.saleRed,fontWeight:700 }}>Please choose your size and color to continue</p>
              </div>
            )}

            {/* QTY + ADD TO CART — Forest Green */}
            <div style={{ display:'flex',gap:10,alignItems:'stretch' }}>
              <QuantityStepper quantity={quantity} setQuantity={setQuantity} max={effectiveStock||1} />
              <button type="button" onClick={handleAddToCart} disabled={!canAddToCart}
                className="pdp-add-btn"
                style={{
                  flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  padding:'0 20px',height:50,borderRadius:12,border:'none',
                  background: !canAddToCart ? T.softBg : addedAnim ? T.greenDark : T.green,
                  color: !canAddToCart ? T.inkMuted : T.white,
                  fontSize:14,fontWeight:800,cursor:canAddToCart?'pointer':'not-allowed',
                  letterSpacing:'-0.01em',
                }}
              >
                {addedAnim ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
                {cartLabel}
              </button>
            </div>

            {/* BULK TIERS — Forest family */}
            {bulkTiers.length > 0 && (
              <div style={{ border:`1px solid ${T.line}`,borderRadius:16,padding:16,background:T.pageBg }}>
                <p style={{ margin:'0 0 10px',fontSize:11,fontWeight:800,color:T.ink,textTransform:'uppercase',letterSpacing:'0.08em' }}>Bulk pricing</p>
                <div style={{ display:'grid',gap:8 }}>
                  {bulkTiers.map(tier => {
                    const isActive  = bulkPricing.appliedTier?.minimum_quantity === tier.minimum_quantity;
                    const tierPrice = calculateBulkPricing(product, tier.minimum_quantity).finalUnitPrice;
                    return (
                      <div key={tier.minimum_quantity} style={{
                        display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,
                        padding:'9px 12px',borderRadius:10,
                        border:`1px solid ${isActive?T.greenBorder:T.line}`,
                        background:isActive?T.greenTint:T.white,
                      }}>
                        <span style={{ fontSize:13,fontWeight:700,color:T.ink }}>Buy {tier.minimum_quantity}+ units</span>
                        <span style={{ fontSize:13,color:isActive?T.greenDeep:T.inkLight,fontWeight:700 }}>{tier.discount_percent}% off · ₦{tierPrice.toLocaleString()} each</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <TrustStrip />
          </div>
        </div>

        {/* MOBILE ACCORDIONS */}
        {!isDesktop && (
          <div style={{ marginTop:40,display:'grid',gap:10 }}>
            {TABS.map(({ id, label }) => {
              const title = id==='reviews' ? `Reviews (${product.reviews?.length||0})` : id==='policies' ? 'Delivery & Returns' : label;
              return (
                <MobileSection key={id} id={id} title={title} open={openSection===id} onToggle={() => setOpenSection(p => p===id?'':id)}>
                  <SectionContent id={id} {...sectionProps} />
                </MobileSection>
              );
            })}
          </div>
        )}

        {/* DESKTOP TABS */}
        {isDesktop && (
          <div style={{ marginTop:64,border:`1px solid ${T.line}`,borderRadius:20,overflow:'hidden',background:T.white,boxShadow:T.shadow }}>
            <TabBar active={activeTab} setActive={setActiveTab} reviewCount={product.reviews?.length||0} />
            <div style={{ padding:'36px 32px' }} className="pdp-fade-in" key={activeTab}>
              <SectionContent id={activeTab} {...sectionProps} />
            </div>
          </div>
        )}

        <div style={{ marginTop:72,display:'flex',flexDirection:'column',gap:56 }}>
          <RelatedProducts currentProductId={product.id} categorySlug={product.categories?.[0]?.slug||null} storeId={product.stores?.id} />
          <RecentlyViewedProducts currentProductId={product.id} />
        </div>
      </div>

      {/* MOBILE STICKY CTA — Onyx bg, Forest button */}
      {!isDesktop && (
        <div style={{
          position:'fixed',left:12,right:12,bottom:12,zIndex:50,
          borderRadius:20,background:'rgba(255,255,255,0.96)',
          border:`1px solid ${T.line}`,boxShadow:T.shadowLg,
          backdropFilter:'blur(16px)',padding:'12px 14px',
        }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:10 }}>
            <div style={{ minWidth:0 }}>
              {promotions.length > 0 && (
                <div style={{ display:'flex',alignItems:'center',gap:5,marginBottom:3 }}>
                  <span style={{
                    fontSize:10,fontWeight:800,color:T.white,
                    background:promotions[0].badge_bg_color||T.greenDeep,
                    padding:'2px 7px',borderRadius:100,
                  }}>
                    {promotions[0].display_name}
                  </span>
                </div>
              )}
              <p className="pdp-heading" style={{ margin:0,fontSize:20,color:T.ink,fontWeight:900,letterSpacing:'-0.03em' }}>
                ₦{currentPrice?.toLocaleString('en-NG')}
              </p>
              {selectedVariantLabel && <p style={{ margin:'1px 0 0',fontSize:11,color:T.inkMuted }}>{selectedVariantLabel}</p>}
            </div>
            <button type="button" onClick={handleAddToCart} disabled={!canAddToCart}
              style={{
                flex:'0 0 auto',minWidth:154,height:46,border:'none',borderRadius:14,
                padding:'0 18px',fontSize:13,fontWeight:800,
                color:!canAddToCart?T.inkMuted:T.white,
                background:!canAddToCart?T.softBg:addedAnim?T.greenDark:T.green,
                cursor:canAddToCart?'pointer':'not-allowed',
                transition:'all 0.2s ease',
              }}
            >{cartLabel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

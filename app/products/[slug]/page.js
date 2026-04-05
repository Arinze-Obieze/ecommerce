"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiShoppingCart, FiHeart, FiStar, FiChevronLeft,
  FiMinus, FiPlus, FiShare2, FiCheck, FiTruck,
  FiRefreshCw, FiShield, FiZoomIn,
} from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import RelatedProducts from '@/components/RelatedProducts';
import { DEFAULT_RETURN_POLICY } from '@/utils/returnPolicy';
import { calculateBulkPricing, getBulkDiscountTiers } from '@/utils/bulkPricing';

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const T = {
  green:        '#00B86B',
  greenDark:    '#0F7A4F',
  greenDeep:    '#0A3D2E',
  greenTint:    '#EDFAF3',
  greenBorder:  '#A8DFC4',
  white:        '#FFFFFF',
  pageBg:       '#F9FAFB',
  charcoal:     '#111111',
  medGray:      '#666666',
  mutedText:    '#999999',
  border:       '#E8E8E8',
  softGray:     '#F5F5F5',
  saleRed:      '#E53935',
  saleBg:       '#FEF2F2',
  starYellow:   '#F59E0B',
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getUniqueOptions(variants, key) {
  return [...new Set((variants || []).map(v => v?.[key]).filter(Boolean))];
}
function pickDefaultVariant(variants) {
  if (!Array.isArray(variants) || !variants.length) return null;
  return variants.find(v => Number(v.stock_quantity) > 0) || variants[0];
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────
const StarRow = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} size={13}
          style={{ color: s <= Math.round(rating) ? T.starYellow : T.border,
                   fill:  s <= Math.round(rating) ? T.starYellow : 'none' }} />
      ))}
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color: T.charcoal }}>{Number(rating || 5).toFixed(1)}</span>
    {count !== undefined && (
      <span style={{ fontSize: 13, color: T.mutedText }}>({count} reviews)</span>
    )}
  </div>
);

const IconTile = ({ icon: Icon, size = 16, bg = T.softGray, color = T.charcoal }) => (
  <div style={{ width: 34, height: 34, borderRadius: 9, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon size={size} style={{ color }} />
  </div>
);

const TrustPill = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                border: `1px solid ${T.border}`, borderRadius: 12, background: T.white, flex: 1 }}>
    <Icon size={14} style={{ color: T.green, flexShrink: 0 }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: T.charcoal, lineHeight: 1.4 }}>{label}</span>
  </div>
);

// Image gallery
function ImageGallery({ images, productName }) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  const all = images?.length ? images : ['https://placehold.co/600x800'];

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Thumbnails — desktop only */}
      {all.length > 1 && (
        <div
          className="hidden lg:flex"
          style={{ flexDirection: 'column', gap: 8, flexShrink: 0, maxHeight: 'min(72vh, 900px)', overflowY: 'auto', paddingRight: 4 }}
        >
          {all.map((url, i) => (
            <button key={i} type="button" onClick={() => setSelected(i)}
              style={{
                width: 72, height: 86, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${i === selected ? T.green : 'transparent'}`,
                opacity: i === selected ? 1 : 0.6,
                transition: 'all 0.18s', padding: 0, background: T.softGray,
              }}
              onMouseEnter={e => { if (i !== selected) e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { if (i !== selected) e.currentTarget.style.opacity = '0.6'; }}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div style={{ flex: 1 }}>
        <div
          ref={imgRef}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
          style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            aspectRatio: '3/4', background: T.softGray, cursor: 'zoom-in',
          }}
        >
          <img
            src={all[selected]}
            alt={productName}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: zoomed ? 'scale(1.6)' : 'scale(1)',
              transition: zoomed ? 'transform 0.15s ease-out' : 'transform 0.3s ease-out',
            }}
          />
          <div style={{ position: 'absolute', bottom: 12, right: 12,
                        background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '5px 8px',
                        display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)' }}>
            <FiZoomIn size={12} style={{ color: T.charcoal }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.charcoal }}>HOVER TO ZOOM</span>
          </div>
        </div>

        {/* Mobile thumbnails */}
        {all.length > 1 && (
          <div
            className="flex lg:hidden"
            style={{ gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}
          >
            {all.map((url, i) => (
              <button key={i} type="button" onClick={() => setSelected(i)}
                style={{
                  width: 60, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  border: `2px solid ${i === selected ? T.green : 'transparent'}`,
                  opacity: i === selected ? 1 : 0.6, padding: 0, cursor: 'pointer',
                }}
              >
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Option selector (sizes / colors)
function OptionPills({ label, options, selected, onSelect, getAvailable }) {
  const [hov, setHov] = useState(null);
  if (!options.length) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>{label}</span>
        {selected && <span style={{ fontSize: 12, color: T.medGray }}>{selected}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const isSelected = opt === selected;
          const isAvailable = getAvailable ? getAvailable(opt) : true;
          return (
            <button key={opt} type="button"
              onClick={() => isAvailable && onSelect(opt)}
              onMouseEnter={() => setHov(opt)}
              onMouseLeave={() => setHov(null)}
              style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                border: `2px solid ${isSelected ? T.green : hov === opt && isAvailable ? T.greenBorder : T.border}`,
                background: isSelected ? T.green : hov === opt && isAvailable ? T.greenTint : T.white,
                color: isSelected ? T.white : isAvailable ? T.charcoal : T.mutedText,
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.45,
                textDecoration: isAvailable ? 'none' : 'line-through',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {opt}
              {isSelected && (
                <FiCheck size={10} style={{ marginLeft: 5, verticalAlign: 'middle' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Quantity stepper
function QuantityStepper({ quantity, setQuantity, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                  border: `1.5px solid ${T.border}`, borderRadius: 12,
                  background: T.white, overflow: 'hidden', height: 48 }}>
      <button type="button"
        onClick={() => setQuantity(q => Math.max(1, q - 1))}
        style={{ width: 46, height: '100%', border: 'none', background: 'none',
                 cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                 color: quantity <= 1 ? T.mutedText : T.charcoal,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderRight: `1px solid ${T.border}` }}
      >
        <FiMinus size={14} />
      </button>
      <span style={{ width: 48, textAlign: 'center', fontSize: 15, fontWeight: 800, color: T.charcoal }}>
        {quantity}
      </span>
      <button type="button"
        onClick={() => setQuantity(q => q < max ? q + 1 : q)}
        disabled={quantity >= max}
        style={{ width: 46, height: '100%', border: 'none', background: 'none',
                 cursor: quantity >= max ? 'not-allowed' : 'pointer',
                 color: quantity >= max ? T.mutedText : T.charcoal,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderLeft: `1px solid ${T.border}` }}
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
}

// Tab bar
const TABS = [
  { id: 'description',    label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'reviews',        label: 'Reviews' },
  { id: 'policies',       label: 'Returns & Policies' },
];

function TabBar({ active, setActive, reviewCount }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, overflowX: 'auto' }}>
      {TABS.map(t => {
        const label = t.id === 'reviews' ? `Reviews (${reviewCount})` : t.label;
        const isActive = active === t.id;
        return (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}
            style={{
              padding: '15px 20px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
              border: 'none', background: 'none', cursor: 'pointer',
              color: isActive ? T.green : T.medGray,
              borderBottom: `2.5px solid ${isActive ? T.green : 'transparent'}`,
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Reviews tab content
function ReviewsTab({ product, user, supabase, onReviewAdded }) {
  const [rating, setRating]       = useState(5);
  const [comment, setComment]     = useState('');
  const [hovStar, setHovStar]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [submitHov, setSubmitHov] = useState(false);
  const [focused, setFocused]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { setError('Please enter a comment.'); return; }
    setLoading(true); setError(''); setSuccess(false);
    try {
      const res  = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      onReviewAdded({ id: data.id || Date.now(), rating, comment, created_at: new Date().toISOString() });
      setComment(''); setRating(5); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reviews = product.reviews || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="lg:grid-cols-3-custom">
      <div style={{ display: 'grid', gap: 40 }} className="lg:grid-cols-[1fr_340px]">
        {/* Review list */}
        <div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: T.pageBg,
                          borderRadius: 16, border: `1.5px dashed ${T.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: T.charcoal, margin: '0 0 6px' }}>No reviews yet</p>
              <p style={{ fontSize: 13, color: T.mutedText, margin: 0 }}>Be the first to share your thoughts</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {reviews.map((rev, i) => (
                <div key={rev.id}
                  style={{ paddingTop: i === 0 ? 0 : 20, paddingBottom: 20,
                            borderBottom: i < reviews.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.greenTint,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 16, flexShrink: 0 }}>
                      👤
                    </div>
                    <div>
                      <StarRow rating={rev.rating} />
                      <span style={{ fontSize: 11, color: T.mutedText, marginTop: 2, display: 'block' }}>
                        {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.7, margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write review form */}
        <div style={{ background: T.pageBg, borderRadius: 16, padding: 24, border: `1px solid ${T.border}`, alignSelf: 'start' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: T.charcoal, margin: '0 0 18px' }}>Write a Review</p>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: 13, color: T.mutedText, marginBottom: 16 }}>Sign in to leave a review</p>
              <Link href="/login" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                                          background: T.green, color: T.white, textDecoration: 'none',
                                          fontSize: 13, fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.charcoal, margin: '0 0 8px' }}>Your Rating</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHovStar(s)} onMouseLeave={() => setHovStar(0)}
                      onClick={() => setRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <FiStar size={26}
                        style={{ color: s <= (hovStar || rating) ? T.starYellow : T.border,
                                 fill:  s <= (hovStar || rating) ? T.starYellow : 'none',
                                 transition: 'all 0.1s' }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.charcoal, margin: '0 0 8px' }}>Your Review</p>
                <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="What did you think of this product?"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'vertical',
                           border: `1.5px solid ${focused ? T.green : T.border}`,
                           background: T.white, fontSize: 13, color: T.charcoal, outline: 'none',
                           boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }} />
              </div>
              {error   && <p style={{ fontSize: 12, color: '#DC2626', background: T.saleBg, padding: '8px 12px', borderRadius: 8, margin: 0 }}>{error}</p>}
              {success && <p style={{ fontSize: 12, color: T.green, background: T.greenTint, padding: '8px 12px', borderRadius: 8, margin: 0, fontWeight: 600 }}>Review submitted — thank you!</p>}
              <button type="submit" disabled={loading}
                onMouseEnter={() => setSubmitHov(true)} onMouseLeave={() => setSubmitHov(false)}
                style={{ padding: '11px 0', borderRadius: 10, border: 'none',
                         background: submitHov ? T.greenDark : T.green,
                         color: T.white, fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                         opacity: loading ? 0.7 : 1, transition: 'background 0.18s' }}>
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ReturnPolicyTable({ policy }) {
  const rows = Array.isArray(policy?.rows) && policy.rows.length ? policy.rows : DEFAULT_RETURN_POLICY.rows;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 900, color: T.charcoal, margin: '0 0 6px' }}>
          {policy?.title || DEFAULT_RETURN_POLICY.title}
        </p>
        <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.7, margin: 0 }}>
          {policy?.subtitle || DEFAULT_RETURN_POLICY.subtitle}
        </p>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={{ background: T.pageBg }}>
              {['Scenario', 'Window', 'Condition', 'Resolution', 'Notes'].map((label) => (
                <th
                  key={label}
                  style={{
                    padding: '14px 16px',
                    borderBottom: `1px solid ${T.border}`,
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 800,
                    color: T.charcoal,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index} style={{ background: index % 2 === 0 ? T.white : '#FCFCFC' }}>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                  {row.scenario}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray }}>
                  {row.window}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray, lineHeight: 1.65 }}>
                  {row.condition}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.greenDark, fontWeight: 700 }}>
                  {row.resolution}
                </td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.medGray, lineHeight: 1.65 }}>
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 18, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <IconTile icon={FiShield} bg={T.greenTint} color={T.green} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.charcoal, margin: '0 0 4px' }}>Need help with a return?</p>
          <p style={{ fontSize: 13, color: T.medGray, margin: 0, lineHeight: 1.65 }}>
            {policy?.support_text || DEFAULT_RETURN_POLICY.support_text}{' '}
            <Link href="/support" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart }                   = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct]       = useState(null);
  const [returnPolicy, setReturnPolicy] = useState(DEFAULT_RETURN_POLICY);
  const [variants, setVariants]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity]     = useState(1);
  const [activeTab, setActiveTab]   = useState('description');
  const [user, setUser]             = useState(null);
  const [toast, setToast]           = useState('');
  const [addedAnim, setAddedAnim]   = useState(false);
  const [wishHov, setWishHov]       = useState(false);
  const [shareHov, setShareHov]     = useState(false);
  const [cartHov, setCartHov]       = useState(false);
  const [visitHov, setVisitHov]     = useState(false);
  const [backHov, setBackHov]       = useState(false);

  const { slug } = React.use(params);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [pRes, vRes] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache: 'no-store' }),
          fetch(`/api/products/${slug}/variants`, { cache: 'no-store' }),
        ]);
        const pData = await pRes.json();
        const vData = await vRes.json();
        if (!pRes.ok) throw new Error(pData.error);

        const fetchedVariants = Array.isArray(vData?.variants) ? vData.variants : [];
        setProduct(pData);
        setReturnPolicy(pData.return_policy || DEFAULT_RETURN_POLICY);
        setVariants(fetchedVariants);

        try {
          const views = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
          const next  = [pData.id, ...views.filter(id => id !== pData.id)].slice(0, 15);
          localStorage.setItem('recently_viewed_products', JSON.stringify(next));
        } catch {}

        const def = pickDefaultVariant(fetchedVariants);
        if (def) {
          setSelectedSize(def.size || null);
          setSelectedColor(def.color || null);
        } else {
          setSelectedSize(pData.sizes?.[0] || null);
          setSelectedColor(pData.colors?.[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const sizeOptions  = useMemo(() => {
    const f = getUniqueOptions(variants, 'size');
    return f.length ? f : (Array.isArray(product?.sizes) ? product.sizes : []);
  }, [variants, product]);

  const colorOptions = useMemo(() => {
    const f = getUniqueOptions(variants, 'color');
    return f.length ? f : (Array.isArray(product?.colors) ? product.colors : []);
  }, [variants, product]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(v => {
      const sm = sizeOptions.length  ? v.size  === selectedSize  : true;
      const cm = colorOptions.length ? v.color === selectedColor : true;
      return sm && cm;
    }) || null;
  }, [variants, sizeOptions.length, colorOptions.length, selectedSize, selectedColor]);

  const effectiveStock    = selectedVariant
    ? Number(selectedVariant.stock_quantity) || 0
    : Number(product?.stock_quantity) || 0;
  const requiresVariant   = variants.length > 0;
  const canAddToCart      = requiresVariant ? Boolean(selectedVariant) && effectiveStock > 0 : effectiveStock > 0;
  const bulkPricing       = useMemo(() => calculateBulkPricing(product, quantity), [product, quantity]);
  const bulkDiscountTiers = useMemo(() => getBulkDiscountTiers(product), [product]);
  const baseDiscountPercent = product?.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) : null;
  const currentPrice      = bulkPricing.finalUnitPrice;
  const compareAtPrice    = bulkPricing.hasBulkDiscount
    ? bulkPricing.baseUnitPrice
    : (product?.discount_price ? product.price : null);
  const activeDiscountPercent = bulkPricing.hasBulkDiscount
    ? bulkPricing.appliedTier?.discount_percent
    : baseDiscountPercent;
  const inWishlist        = product ? isInWishlist(product.id) : false;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleShare = async () => {
    const data = { title: product?.name, text: product?.description?.slice(0, 100), url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      try { await navigator.clipboard.writeText(data.url); showToast('Link copied!'); } catch {}
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart({
      ...product,
      variant_id:    selectedVariant?.id || null,
      stock_quantity: effectiveStock,
      selectedSize:  selectedVariant?.size  || selectedSize,
      selectedColor: selectedVariant?.color || selectedColor,
      quantity,
    });
    setAddedAnim(true);
    showToast('Added to cart!');
    setTimeout(() => setAddedAnim(false), 1800);
  };

  const handleReviewAdded = (rev) => {
    setProduct(prev => ({ ...prev, reviews: [rev, ...(prev.reviews || [])] }));
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.white, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 48 }}
             className="lg:grid-cols-2">
          {[['100%', '100%', '66.66%'], ['100%']].map((widths, gi) => (
            <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {widths.map((w, i) => (
                <div key={i} className="animate-pulse"
                  style={{ width: w, aspectRatio: i === 0 && gi === 0 ? '3/4' : undefined,
                            height: i === 0 && gi === 0 ? undefined : 24,
                            borderRadius: 16, background: T.softGray }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: T.charcoal }}>Product not found</p>
        <Link href="/shop" style={{ color: T.green, fontWeight: 600, fontSize: 14 }}>← Back to Shop</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.white }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: T.charcoal, color: T.white,
          padding: '12px 24px', borderRadius: 100, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
        }}>
          <FiCheck size={14} style={{ color: T.green }} /> {toast}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }} className="lg:px-8">

        {/* ── Back nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <button type="button"
            onClick={() => router.back()}
            onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 100, border: `1.5px solid ${backHov ? T.greenBorder : T.border}`,
              background: backHov ? T.greenTint : T.white,
              color: backHov ? T.green : T.charcoal, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <FiChevronLeft size={15} /> Back
          </button>

          {/* Mobile action buttons */}
          <div style={{ display: 'flex', gap: 8 }} className="lg:hidden">
            <button type="button" onClick={() => toggleWishlist(product.id)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${inWishlist ? '#FECACA' : T.border}`,
                       background: inWishlist ? '#FEF2F2' : T.white, cursor: 'pointer',
                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiHeart size={16} style={{ color: inWishlist ? T.saleRed : T.charcoal, fill: inWishlist ? T.saleRed : 'none' }} />
            </button>
            <button type="button" onClick={handleShare}
              style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${T.border}`,
                       background: T.white, cursor: 'pointer',
                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShare2 size={16} style={{ color: T.charcoal }} />
            </button>
          </div>
        </div>

        {/* ── Main product grid ── */}
        <div style={{ display: 'grid', gap: 48, alignItems: 'start' }} className="lg:grid-cols-2">

          {/* Left: image gallery */}
          <ImageGallery images={product.image_urls} productName={product.name} />

          {/* Right: product info panel */}
          <div style={{ position: 'sticky', top: 24 }}>

            {/* Category + rating */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                              textTransform: 'uppercase', color: T.green, background: T.greenTint,
                              border: `1px solid ${T.greenBorder}`, padding: '4px 10px', borderRadius: 100 }}>
                {product.category?.name || 'Collection'}
              </span>
              <StarRow rating={product.rating} count={product.reviews_count || 0} />
            </div>

            {/* Name + action buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: T.charcoal, margin: 0,
                            letterSpacing: '-0.03em', lineHeight: 1.15, flex: 1 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} className="hidden lg:flex">
                <button type="button"
                  onMouseEnter={() => setWishHov(true)} onMouseLeave={() => setWishHov(false)}
                  onClick={() => toggleWishlist(product.id)}
                  style={{ width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
                           border: `1.5px solid ${inWishlist ? '#FECACA' : wishHov ? T.border : T.border}`,
                           background: inWishlist ? '#FEF2F2' : wishHov ? T.softGray : T.white,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  <FiHeart size={16} style={{ color: inWishlist ? T.saleRed : T.charcoal, fill: inWishlist ? T.saleRed : 'none' }} />
                </button>
                <button type="button"
                  onMouseEnter={() => setShareHov(true)} onMouseLeave={() => setShareHov(false)}
                  onClick={handleShare}
                  style={{ width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
                           border: `1.5px solid ${T.border}`, background: shareHov ? T.softGray : T.white,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <FiShare2 size={16} style={{ color: T.charcoal }} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: T.charcoal, letterSpacing: '-0.03em' }}>
                ₦{currentPrice?.toLocaleString()}
              </span>
              {compareAtPrice ? (
                <>
                  <span style={{ fontSize: 18, color: T.mutedText, textDecoration: 'line-through', fontWeight: 500 }}>
                    ₦{compareAtPrice?.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.saleRed,
                                  background: T.saleBg, padding: '3px 8px', borderRadius: 6 }}>
                    -{activeDiscountPercent}%
                  </span>
                </>
              ) : null}
            </div>

            {bulkPricing.hasBulkDiscount && product.price > bulkPricing.baseUnitPrice ? (
              <p style={{ fontSize: 12, color: T.mutedText, margin: '0 0 8px' }}>
                Regular list price: ₦{product.price.toLocaleString()}
              </p>
            ) : null}

            {bulkPricing.hasBulkDiscount ? (
              <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 12, background: T.greenTint, border: `1px solid ${T.greenBorder}` }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: T.greenDeep }}>
                  {bulkPricing.appliedTier.discount_percent}% bulk discount active at {bulkPricing.appliedTier.minimum_quantity}+ units
                </p>
                <p style={{ margin: 0, fontSize: 12, color: T.greenDeep }}>
                  You save ₦{bulkPricing.totalSavings.toLocaleString()} at quantity {quantity}.
                </p>
              </div>
            ) : null}

            {product.sku && (
              <p style={{ fontSize: 11, color: T.mutedText, margin: '0 0 16px', fontWeight: 500 }}>
                SKU: {product.sku}
              </p>
            )}

            {/* Short description */}
            {product.description && (
              <p style={{ fontSize: 14, color: T.medGray, lineHeight: 1.75, margin: '0 0 22px' }}>
                {product.description.length > 200
                  ? product.description.slice(0, product.description.lastIndexOf(' ', 200)) + '…'
                  : product.description}
              </p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: T.border, marginBottom: 20 }} />

            {/* Size + Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
              <OptionPills
                label="Size" options={sizeOptions} selected={selectedSize} onSelect={setSelectedSize}
                getAvailable={sz => !variants.length || variants.some(v => v.size === sz && Number(v.stock_quantity) > 0)}
              />
              <OptionPills
                label="Color" options={colorOptions} selected={selectedColor} onSelect={setSelectedColor}
                getAvailable={cl => !variants.length || variants.some(v => v.color === cl && Number(v.stock_quantity) > 0)}
              />
            </div>

            {/* Stock indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                             background: effectiveStock > 10 ? T.green : effectiveStock > 0 ? '#F59E0B' : T.saleRed }} />
              <span style={{ fontSize: 12, fontWeight: 600,
                              color: effectiveStock > 10 ? T.green : effectiveStock > 0 ? '#D97706' : T.saleRed }}>
                {effectiveStock > 10 ? 'In Stock' : effectiveStock > 0 ? `Only ${effectiveStock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Qty + Add to cart */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }} className="flex-col sm:flex-row">
              <QuantityStepper quantity={quantity} setQuantity={setQuantity} max={effectiveStock || 1} />
              <button type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                onMouseEnter={() => setCartHov(true)} onMouseLeave={() => setCartHov(false)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '0 24px', height: 48, borderRadius: 12, border: 'none', cursor: canAddToCart ? 'pointer' : 'not-allowed',
                  background: !canAddToCart ? T.softGray : addedAnim ? T.greenDeep : cartHov ? T.greenDark : T.green,
                  color: !canAddToCart ? T.mutedText : T.white, fontSize: 14, fontWeight: 800,
                  transition: 'background 0.18s', letterSpacing: '-0.01em',
                }}
              >
                {addedAnim ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
                {!canAddToCart
                  ? (requiresVariant && !selectedVariant ? 'Select Options' : 'Out of Stock')
                  : addedAnim ? 'Added!' : 'Add to Cart'}
              </button>
            </div>

            {bulkDiscountTiers.length > 0 ? (
              <div style={{ marginBottom: 22, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, background: '#FCFCFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.charcoal }}>Bulk pricing</p>
                  <span style={{ fontSize: 12, color: T.medGray }}>
                    Quantity {quantity} total: ₦{bulkPricing.lineTotal.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {bulkDiscountTiers.map((tier) => {
                    const isActiveTier = bulkPricing.appliedTier?.minimum_quantity === tier.minimum_quantity;
                    const tierPrice = calculateBulkPricing(product, tier.minimum_quantity).finalUnitPrice;
                    return (
                      <div
                        key={tier.minimum_quantity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: `1px solid ${isActiveTier ? T.greenBorder : T.border}`,
                          background: isActiveTier ? T.greenTint : T.white,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                          Buy {tier.minimum_quantity}+ pieces
                        </span>
                        <span style={{ fontSize: 13, color: isActiveTier ? T.greenDeep : T.medGray, fontWeight: 700 }}>
                          {tier.discount_percent}% off • ₦{tierPrice.toLocaleString()} each
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Trust pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              <TrustPill icon={FiTruck}    label="Free delivery over ₦50k" />
              <TrustPill icon={FiRefreshCw} label={returnPolicy?.rows?.[0]?.window || '30-day returns'} />
              <TrustPill icon={FiShield}   label="Buyer protection" />
            </div>

            {/* Seller card */}
            {product.stores && (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: 16,
                             display: 'flex', alignItems: 'center', gap: 14 }}>
                {product.stores.logo_url ? (
                  <img src={product.stores.logo_url} alt={product.stores.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                              border: `2px solid ${T.border}`, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.greenTint,
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 fontSize: 18, fontWeight: 800, color: T.green, flexShrink: 0 }}>
                    {product.stores.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                               letterSpacing: '0.1em', color: T.mutedText, margin: '0 0 2px' }}>Seller</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: T.charcoal, margin: '0 0 3px',
                               overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.stores.name}
                  </p>
                  <StarRow rating={product.stores.rating || 4.5} />
                </div>
                <a href={`/store/${product.stores.slug || product.stores.id}`}
                  onMouseEnter={() => setVisitHov(true)} onMouseLeave={() => setVisitHov(false)}
                  style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
                            fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                            border: `1.5px solid ${visitHov ? T.greenBorder : T.border}`,
                            background: visitHov ? T.greenTint : T.white,
                            color: visitHov ? T.green : T.charcoal, display: 'flex', alignItems: 'center', gap: 5 }}>
                  Visit Store
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs section ── */}
        <div style={{ marginTop: 64, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden', background: T.white }}>
          <TabBar active={activeTab} setActive={setActiveTab} reviewCount={product.reviews?.length || 0} />

          <div style={{ padding: '32px 28px' }}>

            {/* Description */}
            {activeTab === 'description' && (
              <div style={{ fontSize: 15, color: T.medGray, lineHeight: 1.8, maxWidth: 720 }}>
                {product.description
                  ? <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{product.description}</p>
                  : <p style={{ margin: 0, color: T.mutedText, fontStyle: 'italic' }}>No description available.</p>}
              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specifications' && (
              <div>
                {product.specifications ? (() => {
                  const entries = typeof product.specifications === 'string'
                    ? product.specifications.split('\n').map((s, i) => [i, s])
                    : Array.isArray(product.specifications)
                      ? product.specifications.map((s, i) => [i, typeof s === 'object' ? s : { key: i, value: s }])
                      : Object.entries(product.specifications);
                  return (
                    <div style={{ display: 'grid', gap: 0, maxWidth: 600 }}>
                      {entries.map(([k, v], i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr',
                                              padding: '13px 0', borderBottom: i < entries.length - 1 ? `1px solid ${T.border}` : 'none', gap: 16 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>
                            {typeof v === 'object' ? v.key : k}
                          </span>
                          <span style={{ fontSize: 13, color: T.medGray }}>
                            {typeof v === 'object' ? v.value : v}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })() : (
                  <p style={{ color: T.mutedText, fontStyle: 'italic', fontSize: 14 }}>No specifications available.</p>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <ReviewsTab product={product} user={user} supabase={supabase} onReviewAdded={handleReviewAdded} />
            )}

            {/* Policies */}
            {activeTab === 'policies' && (
              <ReturnPolicyTable policy={returnPolicy} />
            )}
          </div>
        </div>
      </div>

      {/* ── Related + Recently Viewed ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }} className="lg:px-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <RelatedProducts
            currentProductId={product.id}
            categorySlug={product.categories?.[0]?.slug || null}
            storeId={product.stores?.id}
          />
          <RecentlyViewedProducts currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}

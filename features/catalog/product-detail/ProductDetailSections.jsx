'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiChevronDown, FiRefreshCw, FiShield, FiStar, FiTruck } from 'react-icons/fi';
import { DEFAULT_RETURN_POLICY } from '@/utils/catalog/return-policy';

export const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specifications' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'policies', label: 'Returns & Delivery' },
];

export function StarRow({ rating, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={12}
            style={{
              color: star <= Math.round(rating) ? 'var(--zova-accent-emphasis)' : 'var(--zova-border)',
              fill: star <= Math.round(rating) ? 'var(--zova-accent-emphasis)' : 'none',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-ink)' }}>
        {Number(rating || 5).toFixed(1)}
      </span>
      {count !== undefined ? (
        <span style={{ fontSize: 12, color: 'var(--zova-text-muted)' }}>({count})</span>
      ) : null}
    </div>
  );
}

function SpecificationsPanel({ entries }) {
  if (!entries.length) {
    return (
      <p style={{ color: 'var(--zova-text-muted)', fontStyle: 'italic', fontSize: 14, margin: 0 }}>
        No specifications available.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {entries.map((entry, index) => (
        <div
          key={`${entry.key}-${index}`}
          className="pdp-spec-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 16,
            padding: '14px 10px',
            borderRadius: 8,
            borderBottom: index < entries.length - 1 ? '1px solid var(--zova-border)' : 'none',
            transition: 'background 0.12s',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-ink)' }}>{entry.key}</span>
          <span style={{ fontSize: 13, color: '#5a5d5a', lineHeight: 1.65 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewsPanel({ product, user, onReviewAdded, isDesktop }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const reviews = product.reviews || [];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      setError('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setIsSuccessful(false);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      onReviewAdded({
        id: data.id || Date.now(),
        rating,
        comment,
        created_at: new Date().toISOString(),
      });
      setComment('');
      setRating(5);
      setIsSuccessful(true);
      setTimeout(() => setIsSuccessful(false), 3000);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 32 }} className={isDesktop ? 'lg:grid-cols-[1fr_340px]' : ''}>
      <div>
        {reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'var(--zova-linen)',
              borderRadius: 20,
              border: '1.5px dashed var(--zova-border)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>✍️</div>
            <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--zova-ink)', margin: '0 0 6px' }}>
              No reviews yet
            </p>
            <p style={{ fontSize: 13, color: 'var(--zova-text-muted)', margin: 0 }}>
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          <div>
            {reviews.map((review, index) => (
              <div
                key={review.id}
                style={{
                  paddingTop: index ? 20 : 0,
                  paddingBottom: 20,
                  borderBottom: index < reviews.length - 1 ? '1px solid var(--zova-border)' : 'none',
                }}
                className="pdp-fade-in"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--zova-green-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <StarRow rating={review.rating} />
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--zova-text-muted)',
                        marginTop: 2,
                        display: 'block',
                      }}
                    >
                      {new Date(review.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#5a5d5a', lineHeight: 1.75, margin: 0 }}>
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--zova-linen)',
          borderRadius: 20,
          padding: 24,
          border: '1px solid var(--zova-border)',
          alignSelf: 'start',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--zova-ink)', margin: '0 0 18px' }}>
          Write a Review
        </p>
        {!user ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--zova-text-muted)', marginBottom: 16 }}>
              Sign in to leave a review
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: 10,
                background: 'var(--zova-primary-action)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--zova-text-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}
              >
                Rating
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <FiStar
                      size={26}
                      style={{
                        color:
                          star <= (hoveredStar || rating)
                            ? 'var(--zova-accent-emphasis)'
                            : 'var(--zova-border)',
                        fill:
                          star <= (hoveredStar || rating)
                            ? 'var(--zova-accent-emphasis)'
                            : 'none',
                        transition: 'all 0.1s',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--zova-text-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}
              >
                Your Review
              </p>
              <textarea
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What did you think of this product?"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  resize: 'vertical',
                  border: `1.5px solid ${
                    isFocused ? 'var(--zova-primary-action)' : 'var(--zova-border)'
                  }`,
                  background: '#FFFFFF',
                  fontSize: 13,
                  color: 'var(--zova-ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>
            {error ? (
              <p
                style={{
                  fontSize: 12,
                  color: '#C0392B',
                  background: '#FEF2F2',
                  padding: '8px 12px',
                  borderRadius: 8,
                  margin: 0,
                }}
              >
                {error}
              </p>
            ) : null}
            {isSuccessful ? (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--zova-primary-action)',
                  background: 'var(--zova-green-soft)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                ✓ Review submitted!
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                background: 'var(--zova-primary-action)',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(event) => {
                if (!isSubmitting) event.currentTarget.style.background = 'var(--zova-primary-action-hover)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'var(--zova-primary-action)';
              }}
            >
              {isSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ReturnPolicyPanel({ policy }) {
  const rows =
    Array.isArray(policy?.rows) && policy.rows.length ? policy.rows : DEFAULT_RETURN_POLICY.rows;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <p
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: 'var(--zova-ink)',
            margin: '0 0 6px',
            fontFamily: 'var(--zova-font-display)',
          }}
        >
          {policy?.title || DEFAULT_RETURN_POLICY.title}
        </p>
        <p style={{ fontSize: 14, color: '#5a5d5a', lineHeight: 1.75, margin: 0 }}>
          {policy?.subtitle || DEFAULT_RETURN_POLICY.subtitle}
        </p>
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid var(--zova-border)', borderRadius: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ background: 'var(--zova-linen)' }}>
              {['Scenario', 'Window', 'Condition', 'Resolution', 'Notes'].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: '13px 16px',
                    borderBottom: '1px solid var(--zova-border)',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--zova-ink)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index} style={{ background: index % 2 ? 'var(--zova-linen)' : '#FFFFFF' }}>
                {['scenario', 'window', 'condition', 'resolution', 'notes'].map((field, fieldIndex) => (
                  <td
                    key={field}
                    style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid var(--zova-border)',
                      fontSize: 13,
                      lineHeight: 1.65,
                      color:
                        field === 'resolution'
                          ? 'var(--zova-ink)'
                          : fieldIndex === 0
                            ? 'var(--zova-ink)'
                            : '#5a5d5a',
                      fontWeight: field === 'resolution' || fieldIndex === 0 ? 700 : 400,
                    }}
                  >
                    {row[field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: 18,
          border: '1px solid var(--zova-border)',
          borderRadius: 14,
          background: 'var(--zova-linen)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--zova-green-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FiShield size={16} style={{ color: 'var(--zova-primary-action)' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--zova-ink)', margin: '0 0 4px' }}>
            Need help with a return?
          </p>
          <p style={{ fontSize: 13, color: '#5a5d5a', margin: 0, lineHeight: 1.65 }}>
            {policy?.support_text || DEFAULT_RETURN_POLICY.support_text}{' '}
            <Link href="/support" style={{ color: 'var(--zova-primary-action)', fontWeight: 700, textDecoration: 'none' }}>
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({ product, storeName, specEntries, returnPolicy, selectedVariantLabel }) {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <p style={{ fontSize: 15, color: '#5a5d5a', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
        {product.description || 'No description available.'}
      </p>
      <div style={{ display: 'grid', gap: 12 }} className="sm:grid-cols-2">
        <div style={{ border: '1px solid var(--zova-border)', borderRadius: 16, padding: 18, background: 'var(--zova-linen)' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--zova-ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Purchase details
          </p>
          {[
            ['Seller', storeName],
            ['Free delivery', 'Orders over ₦50,000'],
            ['Returns', returnPolicy?.rows?.[0]?.window || '30-day policy'],
            selectedVariantLabel ? ['Selected', selectedVariantLabel] : null,
          ]
            .filter(Boolean)
            .map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 13,
                  marginBottom: 9,
                  paddingBottom: 9,
                  borderBottom: '1px solid var(--zova-border)',
                }}
              >
                <span style={{ color: '#5a5d5a', fontWeight: 500 }}>{key}</span>
                <span style={{ color: 'var(--zova-ink)', fontWeight: 700, textAlign: 'right' }}>
                  {value}
                </span>
              </div>
            ))}
        </div>
        {specEntries.length > 0 ? (
          <div style={{ border: '1px solid var(--zova-border)', borderRadius: 16, padding: 18, background: '#FFFFFF' }}>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--zova-ink)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Key specs
            </p>
            {specEntries.slice(0, 5).map((entry) => (
              <div
                key={`${entry.key}-${entry.value}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 10,
                  marginBottom: 9,
                  paddingBottom: 9,
                  borderBottom: '1px solid var(--zova-border)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--zova-ink)' }}>{entry.key}</span>
                <span style={{ fontSize: 12, color: '#5a5d5a' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TabBar({ active, setActive, reviewCount }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--zova-border)', overflowX: 'auto', gap: 0 }}>
      {TABS.map(({ id, label }) => {
        const computedLabel = id === 'reviews' ? `Reviews (${reviewCount})` : label;
        const isActive = active === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className="pdp-tab-btn"
            style={{
              padding: '16px 24px',
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--zova-ink)' : 'var(--zova-text-muted)',
              borderBottom: `2.5px solid ${
                isActive ? 'var(--zova-primary-action)' : 'transparent'
              }`,
              marginBottom: -1,
            }}
          >
            {computedLabel}
          </button>
        );
      })}
    </div>
  );
}

export function SectionContent({
  id,
  product,
  user,
  onReviewAdded,
  storeName,
  specEntries,
  returnPolicy,
  selectedVariantLabel,
  isDesktop,
}) {
  if (id === 'overview') {
    return (
      <OverviewPanel
        product={product}
        storeName={storeName}
        specEntries={specEntries}
        returnPolicy={returnPolicy}
        selectedVariantLabel={selectedVariantLabel}
      />
    );
  }

  if (id === 'specs') {
    return <SpecificationsPanel entries={specEntries} />;
  }

  if (id === 'reviews') {
    return (
      <ReviewsPanel
        product={product}
        user={user}
        onReviewAdded={onReviewAdded}
        isDesktop={isDesktop}
      />
    );
  }

  if (id === 'policies') {
    return <ReturnPolicyPanel policy={returnPolicy} />;
  }

  return null;
}

export function MobileSection({ id, title, open, onToggle, children }) {
  return (
    <section
      id={id}
      style={{
        border: '1px solid var(--zova-border)',
        borderRadius: 18,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 18px',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--zova-ink)' }}>{title}</span>
        <FiChevronDown
          size={15}
          style={{
            color: 'var(--zova-text-body)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s',
            flexShrink: 0,
          }}
        />
      </button>
      {open ? <div style={{ padding: '0 18px 20px' }} className="pdp-fade-in">{children}</div> : null}
    </section>
  );
}

export function TrustStrip() {
  const items = [
    { icon: FiTruck, label: 'Free delivery', value: 'Over ₦50k' },
    { icon: FiRefreshCw, label: 'Easy returns', value: '30 days' },
    { icon: FiShield, label: 'Secure payment', value: 'Protected' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        border: '1px solid var(--zova-border)',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--zova-linen)',
      }}
    >
      {items.map(({ icon: Icon, label, value }, index) => (
        <div
          key={label}
          style={{
            padding: '14px 10px',
            textAlign: 'center',
            borderLeft: index > 0 ? '1px solid var(--zova-border)' : 'none',
          }}
        >
          <Icon size={16} style={{ color: 'var(--zova-primary-action)', display: 'block', margin: '0 auto 6px' }} />
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: 'var(--zova-ink)' }}>{value}</p>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--zova-text-muted)' }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

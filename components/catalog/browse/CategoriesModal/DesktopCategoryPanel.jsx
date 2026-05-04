'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import GroupLink from './GroupLink';

export default function DesktopCategoryPanel({ activeCategory, onClose }) {
  if (!activeCategory) return null;

  return (
    <div className="zova-categories-content" style={{ padding: '22px 28px' }}>
      <div
        className="zova-categories-content-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${'var(--zova-border)'}`,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--zova-primary-action)',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {activeCategory.name}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 4 }}>
            {activeCategory.children?.reduce((accumulator, group) => accumulator + (group.children?.length || 0), 0)} styles
            across {activeCategory.children?.length} groups
          </p>
        </div>

        <Link
          href={`/shop/${activeCategory.slug}`}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--zova-primary-action)',
            textDecoration: 'none',
            marginTop: 3,
            flexShrink: 0,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(event) => { event.currentTarget.style.color = 'var(--zova-warning)'; }}
          onMouseLeave={(event) => { event.currentTarget.style.color = 'var(--zova-primary-action)'; }}
        >
          View All <FiArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>

      <div className="zova-categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px 24px' }}>
        {activeCategory.children?.map((group, groupIndex) => (
          <div key={group.id || groupIndex}>
            <Link
              href={`/shop/${group.slug}`}
              onClick={onClose}
              style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.17em',
                color: 'var(--zova-text-muted)',
                marginBottom: 8,
                textDecoration: 'none',
                transition: 'color 0.12s',
              }}
              onMouseEnter={(event) => { event.currentTarget.style.color = 'var(--zova-primary-action)'; }}
              onMouseLeave={(event) => { event.currentTarget.style.color = 'var(--zova-text-muted)'; }}
            >
              {group.name}
            </Link>

            <div style={{ width: 18, height: 2, backgroundColor: 'var(--zova-accent-emphasis)', opacity: 0.6, borderRadius: 2, marginBottom: 9 }} />

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.children?.map((item, itemIndex) => (
                <li key={item.id || itemIndex} style={{ marginBottom: 6 }}>
                  <GroupLink item={item} onClose={onClose} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="zova-categories-banner"
        style={{
          marginTop: 22,
          borderRadius: 10,
          padding: '13px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--zova-green-soft)',
          border: `1px solid ${'#c2d9b4'}`,
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-primary-action)', margin: 0 }}>New Season Arrivals</p>
          <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 2 }}>
            Fresh styles just landed in {activeCategory.name}
          </p>
        </div>
        <Link
          href={`/shop/${activeCategory.slug}?filter=new`}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 7,
            backgroundColor: 'var(--zova-primary-action)',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 0.14s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = 'var(--zova-primary-action-hover)'; }}
          onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'var(--zova-primary-action)'; }}
        >
          Shop Now <FiArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>
    </div>
  );
}

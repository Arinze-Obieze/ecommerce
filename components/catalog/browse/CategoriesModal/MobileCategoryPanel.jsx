'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function MobileCategoryPanel({ category, onClose }) {
  return (
    <div className="md:hidden" style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${'var(--zova-border)'}` }}>
      <div style={{ padding: '12px 16px 16px' }}>
        <Link
          href={`/shop/${category.slug}`}
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--zova-primary-action)',
            textDecoration: 'none',
            marginBottom: 14,
          }}
        >
          View All {category.name} <FiArrowRight style={{ width: 12, height: 12 }} />
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {category.children?.map((group, groupIndex) => (
            <div key={group.id || groupIndex}>
              <Link
                href={`/shop/${group.slug}`}
                onClick={onClose}
                style={{
                  display: 'block',
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--zova-text-muted)',
                  marginBottom: 8,
                  textDecoration: 'none',
                }}
              >
                {group.name}
              </Link>
              <div style={{ width: 16, height: 2, backgroundColor: 'var(--zova-accent-emphasis)', opacity: 0.6, borderRadius: 2, marginBottom: 8 }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                {group.children?.map((item, itemIndex) => (
                  <li key={item.id || itemIndex}>
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={onClose}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        color: 'var(--zova-text-body)',
                        textDecoration: 'none',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                      {item.is_new ? (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            padding: '2px 5px',
                            borderRadius: 20,
                            flexShrink: 0,
                            backgroundColor: 'var(--zova-accent-soft)',
                            color: 'var(--zova-warning)',
                            border: `1px solid ${'#f5d06e'}`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          New
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            backgroundColor: 'var(--zova-green-soft)',
            border: `1px solid ${'#c2d9b4'}`,
          }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--zova-primary-action)', margin: 0 }}>New Arrivals</p>
            <p style={{ fontSize: 11, color: 'var(--zova-text-muted)', marginTop: 2 }}>Fresh styles in {category.name}</p>
          </div>
          <Link
            href={`/shop/${category.slug}?filter=new`}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '9px',
              borderRadius: 8,
              backgroundColor: 'var(--zova-primary-action)',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Shop Now <FiArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

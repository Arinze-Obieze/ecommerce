'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GroupLink({ item, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/shop/${item.slug}`}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12.5,
        color: hovered ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
        paddingLeft: hovered ? 3 : 0,
        textDecoration: 'none',
        transition: 'color 0.12s, padding-left 0.12s',
      }}
    >
      {item.name}
      {item.is_new ? (
        <span
          style={{
            fontSize: 8,
            fontWeight: 800,
            padding: '2px 5px',
            borderRadius: 20,
            backgroundColor: 'var(--zova-accent-soft)',
            color: 'var(--zova-warning)',
            border: '1px solid #f5d06e',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}
        >
          New
        </span>
      ) : null}
    </Link>
  );
}

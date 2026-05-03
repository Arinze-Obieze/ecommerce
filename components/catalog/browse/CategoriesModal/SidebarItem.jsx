'use client';

import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

export default function SidebarItem({ category, isActive, isExpanded, onClick }) {
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
        display: 'flex',
        alignItems: 'center',
        padding: '11px 14px 11px 16px',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isActive ? '#FFFFFF' : hovered ? 'var(--zova-green-soft)' : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      {isActive ? (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 26,
            backgroundColor: 'var(--zova-accent-emphasis)',
            borderRadius: '0 3px 3px 0',
          }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 12.5,
            fontWeight: isActive ? 700 : 500,
            color: isActive || hovered ? 'var(--zova-primary-action)' : 'var(--zova-ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.12s',
          }}
        >
          {category.name}
        </span>
        {category.children?.length > 0 ? (
          <span style={{ fontSize: 10, color: 'var(--zova-text-muted)', marginTop: 1, display: 'block', opacity: 0.7 }}>
            {category.children.length} groups
          </span>
        ) : null}
      </div>
      <FiChevronRight
        style={{
          width: 13,
          height: 13,
          flexShrink: 0,
          color: isExpanded || isActive ? 'var(--zova-accent-emphasis)' : 'var(--zova-text-muted)',
          opacity: isExpanded || isActive ? 1 : 0.25,
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s, opacity 0.14s, color 0.14s',
        }}
      />
    </button>
  );
}

'use client';

import { FiCheck } from 'react-icons/fi';
import { useState } from 'react';

export function ColorSwatchSelector({
  options = [],
  selected,
  onSelect,
  getAvailable,
  variantMap = {},
}) {
  const [hoveredColor, setHoveredColor] = useState(null);

  if (!options.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* LABEL WITH SELECTED COLOR NAME */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--zova-text-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Available Colors
        </span>
        {selected && (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zova-primary-action)' }}>
            ✓ {selected}
          </span>
        )}
      </div>

      {/* COLOR SWATCHES GRID */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {options.map((option) => {
          const isSelected = option === selected;
          const isAvailable = getAvailable ? getAvailable(option) : true;
          const variant = variantMap[option];
          const hexCode = variant?.color_hex || '#CCCCCC';
          const isHovered = hoveredColor === option;

          return (
            <div key={option} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => isAvailable && onSelect(option)}
                className="color-swatch-btn"
                onMouseEnter={() => isAvailable && setHoveredColor(option)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{
                  position: 'relative',
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  padding: 0,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  overflow: 'hidden',
                  opacity: isAvailable ? 1 : 0.5,
                  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  outline: 'none',
                  boxShadow: isSelected
                    ? '0 0 0 3px var(--zova-primary-action), 0 4px 12px rgba(46, 100, 23, 0.2)'
                    : 'none',
                }}
                title={`${option}${!isAvailable ? ' (unavailable)' : ''}`}
                disabled={!isAvailable}
              >
                {/* Color swatch */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: hexCode,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border:
                      hexCode.toLowerCase() === '#ffffff' ||
                      hexCode.toLowerCase() === '#fffdf9'
                        ? '1px solid #E8E4DC'
                        : 'none',
                  }}
                >
                  {/* Selection checkmark */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 11,
                        border: '3px solid',
                        borderColor:
                          isLightColor(hexCode) && hexCode.toLowerCase() !== '#ec9c00'
                            ? '#191b19'
                            : '#FFFFFF',
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <FiCheck
                          size={20}
                          style={{
                            color:
                              isLightColor(hexCode) && hexCode.toLowerCase() !== '#ec9c00'
                                ? '#191b19'
                                : '#FFFFFF',
                            fontWeight: 800,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unavailable diagonal line */}
                  {!isAvailable && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 11,
                      }}
                    >
                      <div
                        style={{
                          width: '70%',
                          height: 2,
                          background: '#999999',
                          transform: 'rotate(45deg)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </button>

              {/* Hover tooltip with hex code */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--zova-ink)',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(25,27,25,0.2)',
                    animation: 'fadeInUp 0.2s ease-out',
                  }}
                >
                  <div style={{ marginBottom: 2 }}>{option}</div>
                  <div style={{ fontSize: 9, opacity: 0.8 }}>{hexCode.toUpperCase()}</div>
                </div>
              )}

              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(5px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                  }
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to determine if a color is light (for text contrast)
function isLightColor(hexCode) {
  const hex = hexCode.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

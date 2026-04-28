'use client';

import { useEffect, useRef, useState } from 'react';
import { FiX, FiZoomIn } from 'react-icons/fi';

const FALLBACK_MEDIA = [
  {
    id: 'fallback',
    type: 'image',
    url: 'https://placehold.co/600x800/F5F1EA/7a7d7a?text=No+Image',
  },
];

export default function ImageGallery({ media, productName, isDesktop }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef(null);

  const allMedia = media?.length ? media : FALLBACK_MEDIA;
  const currentMedia = allMedia[selectedIndex] || allMedia[0];
  const canZoom = currentMedia?.type !== 'video';

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowRight') setSelectedIndex((index) => (index + 1) % allMedia.length);
      if (event.key === 'ArrowLeft') {
        setSelectedIndex((index) => (index - 1 + allMedia.length) % allMedia.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, allMedia.length]);

  const handleMouseMove = (event) => {
    if (!imageRef.current || !canZoom) return;

    const rect = imageRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const goToPrevious = () => setSelectedIndex((index) => (index - 1 + allMedia.length) % allMedia.length);
  const goToNext = () => setSelectedIndex((index) => (index + 1) % allMedia.length);

  const ThumbnailRail = ({ vertical }) => (
    <div
      className={!vertical ? 'pdp-thumb-rail' : ''}
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: 8,
        ...(vertical
          ? { maxHeight: 520, overflowY: 'auto', width: 72, flexShrink: 0 }
          : { overflowX: 'auto', paddingBottom: 2, marginTop: 10 }),
      }}
    >
      {allMedia.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setSelectedIndex(index)}
          className="pdp-thumb"
          style={{
            width: vertical ? 72 : 58,
            height: vertical ? 88 : 72,
            flexShrink: 0,
            padding: 0,
            border: `2px solid ${
              index === selectedIndex ? 'var(--zova-primary-action)' : 'transparent'
            }`,
            opacity: index === selectedIndex ? 1 : 0.5,
            background: 'var(--zova-surface-alt)',
            boxShadow:
              index === selectedIndex ? '0 0 0 3px var(--zova-green-soft)' : 'none',
          }}
        >
          {item.type === 'video' ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--zova-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.08em',
              }}
            >
              VIDEO
            </div>
          ) : (
            <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: 12, position: isDesktop ? 'sticky' : 'static', top: 24 }}>
        {isDesktop && allMedia.length > 1 ? <ThumbnailRail vertical /> : null}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={imageRef}
            onMouseEnter={() => {
              if (canZoom) setIsZoomed(true);
            }}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            style={{
              position: 'relative',
              borderRadius: 20,
              overflow: 'hidden',
              aspectRatio: '3/4',
              background: 'var(--zova-surface-alt)',
              cursor: canZoom ? 'zoom-in' : 'default',
              boxShadow: '0 2px 16px rgba(25,27,25,0.06)',
            }}
          >
            {currentMedia?.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt={productName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  transform: isZoomed ? 'scale(1.55)' : 'scale(1)',
                  transition: isZoomed ? 'transform 0.12s ease-out' : 'transform 0.4s ease-out',
                  userSelect: 'none',
                }}
              />
            )}

            {canZoom ? (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid var(--zova-border)',
                  borderRadius: 10,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 2px 16px rgba(25,27,25,0.06)',
                }}
              >
                <FiZoomIn size={12} style={{ color: 'var(--zova-text-body)' }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--zova-text-body)',
                    letterSpacing: '0.06em',
                  }}
                >
                  EXPAND
                </span>
              </button>
            ) : null}

            {allMedia.length > 1 && !isZoomed ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevious();
                  }}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.88)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(25,27,25,0.12)',
                    backdropFilter: 'blur(4px)',
                    fontSize: 18,
                    color: 'var(--zova-ink)',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNext();
                  }}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.88)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(25,27,25,0.12)',
                    backdropFilter: 'blur(4px)',
                    fontSize: 18,
                    color: 'var(--zova-ink)',
                  }}
                >
                  ›
                </button>
              </>
            ) : null}

            {allMedia.length > 1 ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {allMedia.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    style={{
                      width: index === selectedIndex ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background:
                        index === selectedIndex
                          ? 'var(--zova-primary-action)'
                          : 'rgba(255,255,255,0.6)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {!isDesktop && allMedia.length > 1 ? <ThumbnailRail vertical={false} /> : null}
        </div>
      </div>

      {isLightboxOpen ? (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(25,27,25,0.96)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: 900, position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: -48,
                right: 0,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX size={18} />
            </button>
            <div style={{ position: 'absolute', top: -48, left: 0, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              {selectedIndex + 1} / {allMedia.length}
            </div>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#111',
                aspectRatio: '3/4',
                maxHeight: '75vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentMedia?.type === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                />
              ) : (
                <img
                  src={currentMedia?.url}
                  alt={productName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            {allMedia.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  style={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              </>
            ) : null}
            {allMedia.length > 1 ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', overflowX: 'auto' }}>
                {allMedia.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    style={{
                      width: 58,
                      height: 70,
                      flexShrink: 0,
                      borderRadius: 8,
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      border: `2px solid ${
                        index === selectedIndex
                          ? 'var(--zova-primary-action)'
                          : 'rgba(255,255,255,0.2)'
                      }`,
                      background: '#111',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {item.type === 'video' ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: 9,
                          fontWeight: 900,
                        }}
                      >
                        VIDEO
                      </div>
                    ) : (
                      <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

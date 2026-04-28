'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function GrainSVG() {
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 30,
        opacity: 0.028,
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }}
    >
      <filter id="grain-e">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-e)" />
    </svg>
  );
}

function GridLines() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {[33.33, 66.66].map((position) => (
        <div
          key={`v${position}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${position}%`,
            width: 1,
            background: 'rgba(46,100,23,0.04)',
          }}
        />
      ))}
      {[33.33, 66.66].map((position) => (
        <div
          key={`h${position}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${position}%`,
            height: 1,
            background: 'rgba(46,100,23,0.04)',
          }}
        />
      ))}
    </div>
  );
}

function CornerMarks({ show }) {
  const size = 20;
  const weight = 1.5;
  const corners = [
    { top: '5%', left: '4%', borderTop: `${weight}px solid rgba(46,100,23,0.42)`, borderLeft: `${weight}px solid rgba(46,100,23,0.42)` },
    { top: '5%', right: '4%', borderTop: `${weight}px solid rgba(46,100,23,0.42)`, borderRight: `${weight}px solid rgba(46,100,23,0.42)` },
    { bottom: '5%', left: '4%', borderBottom: `${weight}px solid rgba(46,100,23,0.42)`, borderLeft: `${weight}px solid rgba(46,100,23,0.42)` },
    { bottom: '5%', right: '4%', borderBottom: `${weight}px solid rgba(46,100,23,0.42)`, borderRight: `${weight}px solid rgba(46,100,23,0.42)` },
  ];

  return corners.map((corner, index) => (
    <div
      key={index}
      style={{
        position: 'absolute',
        ...corner,
        width: size,
        height: size,
        zIndex: 25,
        opacity: show ? 1 : 0,
        transition: `opacity 0.7s ease ${0.15 + index * 0.07}s`,
      }}
    />
  ));
}

function TopBar({ show, storeName }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 54,
        zIndex: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
        borderBottom: '1px solid rgba(46,100,23,0.16)',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            border: '1.5px solid var(--zova-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--zova-gold)' }} />
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: '#F0F7F2',
            letterSpacing: '0.14em',
            fontFamily: 'var(--zova-font-display)',
            textTransform: 'uppercase',
          }}
        >
          ZOVA
        </span>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(240,247,242,0.32)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'var(--zova-font-sans)',
        }}
      >
        {storeName}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(240,247,242,0.32)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'var(--zova-font-sans)',
          }}
        >
          Onitsha Main Market
        </span>
        <div style={{ width: 1, height: 14, background: 'rgba(46,100,23,0.16)' }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(240,247,242,0.32)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'var(--zova-font-sans)',
          }}
        >
          Nigeria
        </span>
      </div>
    </div>
  );
}

function CentreLockup({ storeName, show, fading }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 28,
        textAlign: 'center',
        pointerEvents: 'none',
        width: '90%',
        maxWidth: 520,
        opacity: fading ? 0 : show ? 1 : 0,
        transition: fading ? 'opacity 0.8s ease' : 'opacity 1s ease 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18, opacity: show ? 1 : 0, transition: 'opacity 1s ease 0.1s' }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(46,100,23,0.42))' }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--zova-primary-action)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--zova-font-sans)' }}>
          Welcome to
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(46,100,23,0.42))' }} />
      </div>
      <div style={{ fontFamily: 'var(--zova-font-display)', fontSize: 'clamp(46px, 9.5vw, 88px)', fontWeight: 700, color: '#F0F7F2', letterSpacing: '-0.015em', lineHeight: 0.95, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 1.1s ease 0.25s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.25s' }}>
        {storeName}
      </div>
      <div style={{ width: show ? '100%' : '0%', height: 1.5, background: 'linear-gradient(to right, transparent 0%, var(--zova-gold) 25%, var(--zova-gold) 75%, transparent 100%)', margin: '16px auto 0', maxWidth: 300, borderRadius: 1, transition: 'width 1.2s cubic-bezier(0.77,0,0.175,1) 0.65s' }} />
      <div style={{ marginTop: 14, fontSize: 10, fontWeight: 600, color: 'rgba(240,247,242,0.32)', letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: 'var(--zova-font-sans)', opacity: show ? 1 : 0, transition: 'opacity 1s ease 0.85s' }}>
        Opening the store
      </div>
    </div>
  );
}

function GatePanel({ side, open }) {
  const isLeft = side === 'left';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: '50%',
        height: '100%',
        transformOrigin: isLeft ? 'left center' : 'right center',
        transform: open ? `perspective(2000px) rotateY(${isLeft ? '-' : ''}115deg)` : 'perspective(2000px) rotateY(0deg)',
        transition: 'transform 2.1s cubic-bezier(0.77, 0, 0.175, 1)',
        zIndex: 20,
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: isLeft ? 'linear-gradient(125deg, #030806 0%, #0A1C10 40%, #0E2416 70%, #060E08 100%)' : 'linear-gradient(235deg, #030806 0%, #091A0E 40%, #0C2013 70%, #060E08 100%)' }} />
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} style={{ position: 'absolute', top: 0, bottom: 0, left: `${index * 14.3}%`, width: 1, background: 'rgba(0,184,107,0.022)' }} />
      ))}
      <div style={{ position: 'absolute', top: '4.5%', bottom: '4.5%', left: '6%', right: '6%', border: '1px solid rgba(0,184,107,0.1)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '8%', bottom: '8%', left: '11%', right: '11%', border: '1px solid rgba(0,184,107,0.05)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '11%', left: '14%', right: '14%', height: '26%', background: 'rgba(0,0,0,0.14)', border: '1px solid rgba(0,184,107,0.07)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '43%', bottom: '11%', left: '14%', right: '14%', background: 'rgba(0,0,0,0.14)', border: '1px solid rgba(0,184,107,0.07)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '41%', left: '8%', right: '8%', height: 1.5, background: 'rgba(0,184,107,0.09)' }} />
      <div style={{ position: 'absolute', [isLeft ? 'right' : 'left']: '17%', top: '50%', transform: 'translateY(-50%)', width: 8, height: 44, background: 'linear-gradient(180deg, #1a1200 0%, #2a1e00 50%, #1a1200 100%)', borderRadius: 3.5, border: '1px solid rgba(0,184,107,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 2.5, height: 22, borderRadius: 1.5, background: 'linear-gradient(180deg, rgba(0,184,107,0.45) 0%, rgba(0,184,107,0.85) 50%, rgba(0,184,107,0.45) 100%)', boxShadow: '0 0 5px rgba(0,184,107,0.25)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, boxShadow: isLeft ? 'inset -70px 0 90px rgba(0,0,0,0.55)' : 'inset 70px 0 90px rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, [isLeft ? 'left' : 'right']: 0, width: 2, background: 'rgba(0,184,107,0.1)' }} />
    </div>
  );
}

function ArchFrame() {
  return (
    <div style={{ position: 'absolute', top: '11%', left: '50%', transform: 'translateX(-50%)', width: 'min(490px, 91vw)', height: 'min(610px, 79vh)', zIndex: 19, pointerEvents: 'none' }}>
      <svg viewBox="0 0 490 125" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '20%', overflow: 'visible' }}>
        <path d="M13,114 L13,62 Q13,-2 245,-2 Q477,-2 477,62 L477,114" fill="none" stroke="rgba(0,184,107,0.32)" strokeWidth="1.5" />
        <path d="M0,122 L0,70 Q0,-14 245,-14 Q490,-14 490,70 L490,122" fill="none" stroke="rgba(0,184,107,0.08)" strokeWidth="1" />
        <rect x="221" y="-13" width="48" height="22" rx="2" fill="#08140A" stroke="rgba(46,100,23,0.46)" strokeWidth="1" />
        <text x="245" y="5" textAnchor="middle" fill="rgba(46,100,23,0.65)" fontSize="7.5" fontFamily="var(--zova-font-sans)" fontWeight="800" letterSpacing="3.5">ZOVA</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, top: '19%', bottom: 0, width: 13, background: 'linear-gradient(to right, #020604, #0C1C10)', borderTop: '1.5px solid rgba(0,184,107,0.28)' }}>
        <div style={{ position: 'absolute', top: -8, left: -3, right: -3, height: 8, background: '#0A1A0D', borderTop: '1px solid rgba(0,184,107,0.36)' }} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: '19%', bottom: 0, width: 13, background: 'linear-gradient(to left, #020604, #0C1C10)', borderTop: '1.5px solid rgba(0,184,107,0.28)' }}>
        <div style={{ position: 'absolute', top: -8, left: -3, right: -3, height: 8, background: '#0A1A0D', borderTop: '1px solid rgba(0,184,107,0.36)' }} />
      </div>
    </div>
  );
}

function AmbientGlow({ progress }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse 55% 45% at 50% 54%, rgba(46,100,23,${0.05 + progress * 0.13}) 0%, transparent 68%)`,
      }}
    />
  );
}

function ProgressBar({ progress }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, zIndex: 32, background: 'rgba(0,184,107,0.07)' }}>
      <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(to right, var(--zova-primary-action-hover), var(--zova-primary-action))', transition: 'width 0.4s linear', boxShadow: '0 0 7px var(--zova-primary-action)' }} />
    </div>
  );
}

function BottomRow({ show, storeName, onSkip }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div style={{ position: 'absolute', bottom: 22, left: '5%', right: '5%', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: show ? 1 : 0, transition: 'opacity 0.8s ease 1s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', width: 8, height: 8 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--zova-gold)', animation: 'e_pulse 2s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--zova-gold)', opacity: 0.3, animation: 'e_ring 2s ease-in-out infinite' }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,247,242,0.32)', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'var(--zova-font-sans)' }}>
          Entering {storeName}
        </span>
      </div>
      <button
        type="button"
        onClick={onSkip}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ padding: '7px 18px', borderRadius: 2, border: `1px solid ${isHovered ? 'rgba(46,100,23,0.42)' : 'rgba(46,100,23,0.16)'}`, background: isHovered ? 'rgba(0,184,107,0.1)' : 'transparent', color: isHovered ? '#F0F7F2' : 'rgba(240,247,242,0.32)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--zova-font-sans)' }}
      >
        Enter now
      </button>
    </div>
  );
}

export default function StoreEntranceOverlay({ storeName, onDone }) {
  const totalMs = 5200;
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const nextProgress = Math.min((timestamp - startRef.current) / totalMs, 1);
      setProgress(nextProgress);
      if (nextProgress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setFadeOut(true), totalMs - 700),
      setTimeout(() => onDone(), totalMs + 300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const skip = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setFadeOut(true);
    setTimeout(onDone, 650);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes e_pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(.85);opacity:.7} }
        @keyframes e_ring  { 0%{transform:scale(1);opacity:.3} 100%{transform:scale(2.6);opacity:0} }
        @keyframes fadeIn_e { from{opacity:0} to{opacity:1} }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden', opacity: fadeOut ? 0 : 1, transition: fadeOut ? 'opacity 0.9s ease' : 'none', background: '#050C07', fontFamily: 'var(--zova-font-sans)' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 75% 65% at 50% 50%, #08140A 0%, #050C07 100%)' }} />
        <GridLines />
        <GrainSVG />
        <AmbientGlow progress={progress} />
        {phase >= 2 ? (
          <div style={{ position: 'absolute', top: '11%', left: '50%', transform: 'translateX(-50%)', width: 'min(490px,91vw)', height: 'min(610px,79vh)', zIndex: 7, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(0,184,107,0.09) 0%, transparent 65%)', animation: 'fadeIn_e 1.2s ease both' }} />
        ) : null}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(490px,91vw)', height: 70, zIndex: 6, pointerEvents: 'none', background: `linear-gradient(to top, rgba(0,184,107,${0.03 + progress * 0.07}) 0%, transparent 100%)` }} />
        <div style={{ position: 'absolute', top: 'calc(11% + min(610px,79vh) * 0.19 + 12px)', left: '50%', transform: 'translateX(-50%)', width: 'min(464px, 87.5vw)', height: 'min(496px, 64vh)', zIndex: 20, overflow: 'hidden' }}>
          <GatePanel side="left" open={phase >= 2} />
          <GatePanel side="right" open={phase >= 2} />
        </div>
        <ArchFrame />
        <CornerMarks show={phase >= 1} />
        <TopBar show={phase >= 1} storeName={storeName} />
        <CentreLockup storeName={storeName} show={phase >= 1} fading={phase >= 2} />
        <ProgressBar progress={progress} />
        <BottomRow show={phase >= 2} storeName={storeName} onSkip={skip} />
      </div>
    </>
  );
}

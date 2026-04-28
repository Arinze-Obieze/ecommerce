"use client";

import BrandMark from "@/components/brand/BrandMark";

export default function AuthShowcase({
  slide,
  setSlide,
  slides,
  pills = [],
  floaters = [],
  mounted = false,
  children,
}) {
  return (
    <div className="zova-auth-showcase max-md:hidden">
      {slides.map((item, index) => (
        <img
          key={item.url}
          src={item.url}
          alt=""
          className="zova-auth-showcase-image"
          style={{
            "--auth-slide-opacity": index === slide ? 1 : 0,
            "--auth-slide-transform": index === slide ? "scale(1.03)" : "scale(1)",
          }}
        />
      ))}

      <div className="zova-auth-showcase-overlay-primary" />
      <div className="zova-auth-showcase-overlay-secondary" />

      {mounted
        ? floaters.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="zova-auth-floater"
              style={{
                top: item.top,
                width: item.size,
                height: item.size,
                transform: `translateX(30%) rotate(${item.rotation}deg)`,
                animation: `zovaFloatBob ${3.8 + index * 0.6}s ease-in-out ${index * 0.5}s infinite`,
              }}
            >
              <img src={item.src} alt="" />
            </div>
          ))
        : null}

      {children}

      <div className="zova-auth-showcase-content">
        <div key={slide} className="zova-auth-showcase-caption">
          <h2 className="zova-auth-showcase-heading serif">{slides[slide].caption}</h2>
          <p className="zova-auth-showcase-copy">{slides[slide].sub}</p>
        </div>

        {pills.length ? (
          <div className="zova-auth-showcase-pill-row">
            {pills.map((pill) => (
              <div key={pill} className="zova-auth-showcase-pill">
                <div className="zova-auth-showcase-pill-dot" />
                <span className="zova-auth-showcase-pill-label">{pill}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="zova-auth-slide-dots">
          {slides.map((item, index) => (
            <button
              key={item.url}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              className={`zova-auth-slide-dot ${index === slide ? "is-active" : ""}`}
              onClick={() => setSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="zova-auth-showcase-brand">
        <BrandMark
          alt="ZOVA"
          priority
          className="zova-auth-showcase-brand-mark"
          imageClassName="p-1.5"
          iconSize={18}
        />
      
      </div>
    </div>
  );
}

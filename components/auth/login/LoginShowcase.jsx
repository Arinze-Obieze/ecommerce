"use client";

import BrandMark from "@/components/brand/BrandMark";
import {
  LOGIN_FLOATERS,
  LOGIN_SLIDES,
  LOGIN_TRUST_PILLS,
} from "@/components/auth/login/login.constants";

export default function LoginShowcase({ slide, setSlide, mounted }) {
  return (
    <div className="zova-auth-showcase max-md:hidden">
      {LOGIN_SLIDES.map((item, index) => (
        <img
          key={index}
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
        ? LOGIN_FLOATERS.map((item, index) => (
            <div
              key={index}
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

      <div className="zova-auth-showcase-content">
        <div key={slide} className="zova-auth-showcase-caption">
          <h2 className="zova-auth-showcase-heading serif">{LOGIN_SLIDES[slide].caption}</h2>
          <p className="zova-auth-showcase-copy">{LOGIN_SLIDES[slide].sub}</p>
        </div>

        <div className="zova-auth-showcase-pill-row">
          {LOGIN_TRUST_PILLS.map((pill) => (
            <div key={pill} className="zova-auth-showcase-pill">
              <div className="zova-auth-showcase-pill-dot" />
              <span className="zova-auth-showcase-pill-label">{pill}</span>
            </div>
          ))}
        </div>

        <div className="zova-auth-slide-dots">
          {LOGIN_SLIDES.map((_, index) => (
            <button
              key={index}
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
          className="zova-auth-showcase-brand-mark h-[30px] w-[104px]"
          iconSize={18}
        />
      </div>
    </div>
  );
}

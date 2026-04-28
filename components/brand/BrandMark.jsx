"use client";

import { useState } from "react";
import Image from "next/image";

export default function BrandMark({
  alt = "ZOVA",
  dark = false,
  priority = false,
  className = "",
  imageClassName = "",
  iconOnly = false,
  iconSize = 28,
}) {
  const [hasError, setHasError] = useState(false);
  const src = iconOnly ? "/icon.svg" : dark ? "/brand/logo-white.svg" : "/brand/logo.svg";
  const fallbackLabel = iconOnly ? "Z" : "ZOVA";
  const wrapperClassName = [
    "zova-brand-mark",
    dark ? "is-dark" : "",
    iconOnly ? "is-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      {hasError ? (
        <span className="zova-brand-fallback" aria-label={alt}>
          {fallbackLabel}
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={iconOnly ? `${iconSize}px` : "220px"}
          className={`object-contain ${iconOnly ? "p-1.5" : "object-left"} ${imageClassName}`.trim()}
          priority={priority}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

"use client";

import BrandMark from "@/components/brand/BrandMark";
import Link from "next/link";

export default function AuthBrandHeader({
  label = "",
  className = "",
  markClassName = "h-[44px] w-[148px] sm:h-[46px] sm:w-[156px]",
  imageClassName = "",
  iconSize = 34,
}) {
  return (
    <div className={`zova-auth-brand-row ${className}`.trim()}>
      <Link href="/">
        <BrandMark
          alt={label || "ZOVA"}
          priority
          className={markClassName}
          imageClassName={imageClassName}
          iconSize={iconSize}
        />
      </Link>
      {label ? <span className="zova-auth-brand-text">{label}</span> : null}
    </div>
  );
}

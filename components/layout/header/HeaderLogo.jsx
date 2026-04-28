"use client";

import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

export default function HeaderLogo() {
  return (
    <Link href="/" aria-label="ZOVA home" className="shrink-0 group">
      <BrandMark
        alt="ZOVA"
        priority
        className="h-[44px] w-[138px] transition-transform duration-300 group-hover:scale-[1.03] sm:h-[46px] sm:w-[148px]"
      />
    </Link>
  );
}

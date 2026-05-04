"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ProductImpressionTracker from "@/components/catalog/ProductImpressionTracker";

const ProductCard = dynamic(() => import("@/components/catalog/ProductCard"));

function ProductTilePlaceholder() {
  return (
    <div
      className="h-full overflow-hidden rounded-[18px] bg-white"
      style={{
        border: "1px solid var(--zova-border)",
        boxShadow: "0 1px 3px rgba(25,27,25,0.06)",
      }}
    >
      <div className="aspect-[3/4]" style={{ background: "var(--zova-surface-alt)" }} />
      <div style={{ padding: "10px 12px 14px" }}>
        <div style={{ height: 8, background: "var(--zova-surface-alt)", borderRadius: 4, width: "55%", marginBottom: 8 }} />
        <div style={{ height: 11, background: "var(--zova-surface-alt)", borderRadius: 4, width: "80%", marginBottom: 8 }} />
        <div style={{ height: 11, background: "var(--zova-surface-alt)", borderRadius: 4, width: "40%", marginBottom: 12 }} />
        <div style={{ height: 32, background: "var(--zova-surface-alt)", borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default function LazyProductTile({
  product,
  index,
  surface,
  trackingMeta,
  eager = false,
}) {
  const rootRef = useRef(null);
  const [isVisible, setIsVisible] = useState(eager);

  useEffect(() => {
    const target = rootRef.current;
    if (!target || isVisible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={rootRef}>
      {isVisible ? (
        <ProductImpressionTracker
          product={product}
          surface={surface}
          position={index + 1}
          metadata={{
            sortStrategy: trackingMeta?.sortStrategy || null,
            persona: trackingMeta?.persona || null,
          }}
        >
          <ProductCard product={product} source={surface} position={index + 1} />
        </ProductImpressionTracker>
      ) : (
        <ProductTilePlaceholder />
      )}
    </div>
  );
}

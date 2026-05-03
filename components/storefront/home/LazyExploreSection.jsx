"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ExploreProducts = dynamic(() => import("@/components/storefront/home/ExploreProducts"), {
  ssr: false,
  loading: () => <ExploreSectionPlaceholder />,
});

function ExploreSectionPlaceholder() {
  return (
    <section style={{ background: "var(--zova-linen)", padding: "56px 0" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 16px" }} className="sm:px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="mx-auto mb-3 h-4 w-32 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto mb-3 h-8 w-64 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
        </div>
        <div style={{ display: "grid", gap: 12 }} className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
              <div style={{ background: "var(--zova-surface-alt)", aspectRatio: "3/4", width: "100%" }} />
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{ height: 8, background: "var(--zova-surface-alt)", borderRadius: 4, marginBottom: 6, width: "60%" }} />
                <div style={{ height: 11, background: "var(--zova-surface-alt)", borderRadius: 4, marginBottom: 8, width: "85%" }} />
                <div style={{ height: 11, background: "var(--zova-surface-alt)", borderRadius: 4, marginBottom: 10, width: "45%" }} />
                <div style={{ height: 30, background: "var(--zova-surface-alt)", borderRadius: 8, width: "100%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LazyExploreSection() {
  const triggerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const target = triggerRef.current;
    if (!target || shouldRender) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      {
        rootMargin: "320px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={triggerRef}>
      {shouldRender ? <ExploreProducts /> : <ExploreSectionPlaceholder />}
    </div>
  );
}

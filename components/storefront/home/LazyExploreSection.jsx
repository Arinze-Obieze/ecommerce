"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ExploreSectionPlaceholder from "@/components/storefront/home/ExploreSectionPlaceholder";

const ExploreProducts = dynamic(() => import("@/components/storefront/home/ExploreProducts"), {
  ssr: false,
  loading: () => <ExploreSectionPlaceholder />,
});

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

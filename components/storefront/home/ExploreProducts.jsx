"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiGrid } from 'react-icons/fi';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImpressionTracker from '@/components/catalog/ProductImpressionTracker';
import ExploreSectionPlaceholder from '@/components/storefront/home/ExploreSectionPlaceholder';
import {
  EXPLORE_PRODUCTS_LIMIT,
  EXPLORE_PRODUCTS_SECTION,
  HOME_EXPLORE_TRACKING,
} from '@/constants/explore-products';
import { getExploreProducts } from '@/features/catalog/api/client';

function ExploreSectionShell({ children }) {
  return (
    <section className="bg-(--zova-linen)" style={{ padding: '16px 0 56px' }}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function ExploreSectionHeader() {
  return (
    <div className="mb-9 text-center">
      <div className="mb-2.5 flex items-center justify-center gap-2">
        <div
          className="h-0.5 w-6 rounded"
          style={{ background: 'var(--zova-accent-emphasis)' }}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-(--zova-primary-action)">
          {EXPLORE_PRODUCTS_SECTION.eyebrow}
        </span>
        <div
          className="h-0.5 w-6 rounded"
          style={{ background: 'var(--zova-accent-emphasis)' }}
        />
      </div>

      <h2
        className="mb-2 text-[clamp(22px,4vw,32px)] font-extrabold leading-[1.15] tracking-[-0.025em] text-(--zova-ink)"
      >
        {EXPLORE_PRODUCTS_SECTION.title}
      </h2>
      <p className="mx-auto mb-[18px] max-w-[440px] text-sm leading-[1.6] text-(--zova-text-body)">
        {EXPLORE_PRODUCTS_SECTION.description}
      </p>

      <Link
        href={EXPLORE_PRODUCTS_SECTION.browseHref}
        className="group inline-flex items-center gap-1.5 border-b-[1.5px] border-(--zova-primary-action) pb-0.5 text-[13px] font-bold text-(--zova-primary-action) transition-colors hover:border-(--zova-primary-action-hover) hover:text-(--zova-primary-action-hover)"
      >
        {EXPLORE_PRODUCTS_SECTION.browseLabel}
        <FiArrowRight className="h-[13px] w-[13px] transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function ExploreProductsGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5">
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface={HOME_EXPLORE_TRACKING.surface}
          position={index + 1}
          metadata={HOME_EXPLORE_TRACKING.metadata}
        >
          <ProductCard product={product} />
        </ProductImpressionTracker>
      ))}
    </div>
  );
}

function ExploreSectionCta() {
  return (
    <div className="mt-11 text-center">
      <Link
        href={EXPLORE_PRODUCTS_SECTION.ctaHref}
        className="inline-flex items-center gap-2 rounded-[10px] border-2 border-(--zova-primary-action) bg-white px-8 py-3 text-sm font-bold text-(--zova-primary-action) transition-[background,color,box-shadow] duration-200 hover:bg-(--zova-primary-action) hover:text-white hover:shadow-[0_4px_14px_rgba(46,100,23,0.2)]"
      >
        <FiGrid className="h-[15px] w-[15px]" />
        {EXPLORE_PRODUCTS_SECTION.ctaLabel}
      </Link>
    </div>
  );
}

const ExploreProducts = ({ initialProducts = null }) => {
  const [products, setProducts] = useState(() => (Array.isArray(initialProducts) ? initialProducts : []));
  const [loading, setLoading] = useState(() => !Array.isArray(initialProducts));

  useEffect(() => {
    if (Array.isArray(initialProducts)) return undefined;

    let active = true;

    (async () => {
      try {
        const json = await getExploreProducts(EXPLORE_PRODUCTS_LIMIT);
        if (active && json.success) setProducts(json.data);
      } catch (err) {
        console.error('Failed to fetch explore products:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialProducts]);

  if (loading) {
    return <ExploreSectionPlaceholder />;
  }

  return (
    <ExploreSectionShell>
      <ExploreSectionHeader />
      <ExploreProductsGrid products={products} />
      <ExploreSectionCta />
    </ExploreSectionShell>
  );
};

export default ExploreProducts;

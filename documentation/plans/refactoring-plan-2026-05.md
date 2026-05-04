# ZOVA Ecommerce — Comprehensive Refactoring Plan

> Created: 2026-05-03  
> Scope: Full codebase — components, contexts, features, utils, styling, state management, performance

---

## Table of Contents

1. [What's Wrong — Specific Issues Found](#1-whats-wrong--specific-issues-found)
2. [New Folder Structure](#2-new-folder-structure)
3. [Which Components to Extract and Where](#3-which-components-to-extract-and-where)
4. [State Management Improvements](#4-state-management-improvements)
5. [Performance Fixes](#5-performance-fixes)
6. [Step-by-Step Migration Plan](#6-step-by-step-migration-plan)
7. [Too Many Concerns in Single Files](#7-too-many-concerns-in-single-files)
8. [Reusable Components You're Missing](#8-reusable-components-youre-missing)
9. [TypeScript: Now or Later?](#9-typescript-now-or-later)
10. [Priority Order (TL;DR)](#10-priority-order-tldr)

---

## 1. What's Wrong — Specific Issues Found

**Codebase health score: 7/10.** The bones are good — your feature-slice pattern is solid, you have consistent `{Page, Sections, useHook, utils, constants}` decomposition in `admin/` and `store-console/`. The problems are concentrated in `components/`, the contexts, styling inconsistency, and a handful of critical god-files.

### A. God-components in `components/`

The worst offenders by line count:

| File | Lines | Core Problem |
|---|---|---|
| `components/catalog/ProductCard.jsx` | 746 | 3 sub-components (`PromotionTags`, `RankBadge`, `TrendingBadge`) defined inline, price helpers, tracking logic — all in one file |
| `components/catalog/browse/FilterSidebar.jsx` | 651 | `PriceBucketButton`, `CategoryChip`, `ColorSwatch` are inline sub-components; `COLOR_OPTIONS`/`SIZE_OPTIONS` constants hardcoded here instead of in a shared location |
| `components/storefront/stores/StoreClient.jsx` | 630 | Mixes store entrance logic with the actual store display |
| `components/catalog/browse/CategoriesModal.jsx` | 562 | Category tree rendering, search, and modal chrome all in one file |
| `components/account/AddressBook.jsx` | 524 | Form + list + delete confirmation + edit flow — at least 4 separate concerns |
| `components/storefront/home/Hero.jsx` | 395 | Slideshow logic entangled with render |

### B. Inline Styles Defeating Tailwind Everywhere

`FilterSidebar.jsx` lines 59–63 — `PriceBucketButton` uses:

```jsx
style={{
  borderColor: 'var(--zova-primary-action)',
  backgroundColor: '#FFFFFF',
  color: isActive ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
}}
```

This pattern repeats throughout the codebase. It defeats Tailwind's tree-shaking and makes conditional styling fragile. The fix is `data-*` attribute variants — e.g., `data-[active=true]:border-(--zova-primary-action)` — which Tailwind v4 supports natively.

### C. Stale Brand Name in Storage Keys

`contexts/cart/CartContext.js` uses `'shophub_cart'` as the localStorage key.  
`utils/telemetry/analytics.js` uses `'shophub_session_id'` and `'shophub_anon_id'`.  

Your brand is ZOVA. These keys are scattered without a constants file, so there's no single place to fix them.

### D. Duplicate Logic in CartContext

`contexts/cart/CartContext.js` has variant-matching logic repeated at least 4 times across `addToCart`, `updateQty`, `removeItem`, and `syncCart`. Each one independently walks the variant array. A single `findVariant(cart, productId, variantId)` helper would replace all four and remove ~80 lines.

### E. FilterContext URL-Sync Complexity

`contexts/filter/FilterContext.js` at 383 lines manages 8+ `useState` hooks and 4 separate refs (`filtersRef`, `currentUrlRef`, `prevUrl`, `pendingUrlRef`) to paper over stale closure bugs. `buildFilterUrl`, `parseParams`, and `buildParams` all partially parse the same URL shape — a clear DRY violation.

### F. product-wizard Step2Page

`features/store-console/product-wizard/Step2Page.jsx` — 1,054 lines. Has `deriveSkuFromName`, `buildAutoSku`, `makeVariantId`, `variantKey`, `normalizeExistingVariant`, `deriveColorSizeFromAttributes` all defined **inside** the component body, not even as module-level functions.

### G. No Design System Primitive Layer

`components/` has domain components (`ProductCard`, `FilterSidebar`) but no base primitives. `Button`, `Badge`, `Modal`, `Chip`, and `Input` are re-implemented ad-hoc in every component. That's why inline styles keep appearing — there's no shared `<Button variant="outline" />` to reach for.

### H. Zero Tests, Zero TypeScript

557 JS/JSX files, 0 test files, 0 `.ts`/`.tsx` files. This is the highest risk factor for safe refactoring.

---

## 2. New Folder Structure

Your current top-level structure is good. The main additions are a `ui/` primitive layer and a root-level `constants/` directory.

```
/app                          ← Next.js App Router (keep as-is)
  /(storefront)
  /(account)
  /(store-console)
  /(admin)
  /(auth)

/features                     ← Feature slices (keep pattern, apply consistently)
  /catalog
    /browse
    /product-detail
    /server
  /cart
    /checkout
  /account
    /order-detail
  /store-console
    /product-wizard           ← Break Step2Page here
    /products/editor
  /admin
  /auth
  /storefront

/components
  /ui                         ← NEW: Design system primitives (see section 3)
    Button.jsx
    Badge.jsx
    Chip.jsx
    Modal.jsx
    Input.jsx
    Select.jsx
    Spinner.jsx
    Skeleton.jsx
    Drawer.jsx
    EmptyState.jsx
    ConfirmModal.jsx
    SearchInput.jsx
  /catalog
    /product-card             ← NEW: Explode ProductCard into a folder
      index.jsx               ← re-exports ProductCard
      PromotionTags.jsx
      ProductBadges.jsx
      ProductCardPricing.jsx
      QuickAddButton.jsx
    /browse
      /FilterSidebar          ← Same: folder, sub-components extracted
        index.jsx
        PriceBucketButton.jsx
        CategoryChip.jsx
        ColorSwatchButton.jsx
        SizeChip.jsx
        FilterSection.jsx
      /CategoriesModal
        index.jsx
        CategoryTreeNode.jsx
        CategorySearchInput.jsx
        SelectedCategoryBreadcrumb.jsx
  /account
    /AddressBook
      index.jsx
      AddressCard.jsx
      AddressForm.jsx         ← shared with checkout
      DeleteAddressModal.jsx
  /auth
  /storefront
  /layout
  /shared

/constants                    ← NEW: All magic numbers and config
  storage-keys.js
  filter-options.js
  shipping.js
  pagination.js

/contexts                     ← Keep 5 contexts, refactor internals
  /cart
    CartContext.js
    cart-utils.js             ← NEW: extracted helper functions
  /filter
    FilterContext.js
    filter-codec.js           ← NEW: filterStateToUrl / urlToFilterState
  /toast
  /location
  /wishlist

/hooks                        ← NEW: Shared cross-feature hooks
  useDebounce.js
  useLocalStorage.js
  useIntersectionObserver.js
  useMediaQuery.js

/utils                        ← Keep, already well-organized
  /catalog
  /platform
  /payments
  /telemetry
  /supabase
  /auth
  /money
```

---

## 3. Which Components to Extract and Where

### ProductCard → `components/catalog/product-card/`

```
ProductCard.jsx (746 lines → target: ~200 lines)
├── PromotionTags.jsx        ← lines 58-110 currently inline
├── ProductBadges.jsx        ← RankBadge + TrendingBadge (lines 117-141)
├── ProductCardPricing.jsx   ← price helpers + SAVINGS_STYLE (lines 27-56)
└── QuickAddButton.jsx       ← quick-add logic extracted
```

### FilterSidebar → `components/catalog/browse/FilterSidebar/`

```
FilterSidebar.jsx (651 lines → target: ~180 lines)
├── PriceBucketButton.jsx    ← lines 53-68 (already a function, just move it)
├── CategoryChip.jsx         ← lines 70-90 (already a function, just move it)
├── ColorSwatchButton.jsx    ← extracted
├── SizeChip.jsx             ← extracted
└── FilterSection.jsx        ← accordion wrapper reused across all filter types
```

`COLOR_OPTIONS` and `SIZE_OPTIONS` move to `/constants/filter-options.js` — they are also needed by `MobileFilterDrawer`.

### CategoriesModal → `components/catalog/browse/CategoriesModal/`

```
CategoriesModal.jsx (562 lines → target: ~150 lines)
├── CategoryTreeNode.jsx              ← recursive category rendering
├── CategorySearchInput.jsx           ← search input with debounce
└── SelectedCategoryBreadcrumb.jsx
```

### AddressBook → `components/account/AddressBook/`

```
AddressBook.jsx (524 lines → target: ~120 lines)
├── AddressCard.jsx          ← display a single saved address
├── AddressForm.jsx          ← add/edit form (reusable in checkout too — see below)
└── DeleteAddressModal.jsx   ← confirmation modal
```

`AddressForm.jsx` is currently duplicated between `AddressBook` and the checkout flow in `features/cart/checkout/CartSections.jsx`. Extract once, use in both places.

### StoreClient → two separate concerns

```
StoreClient.jsx (630 lines) →
├── StoreEntrancePage.jsx    ← entrance overlay + gating logic
└── StoreProductsView.jsx    ← the actual products grid inside a store
```

### Step2Page (product wizard)

```
features/store-console/product-wizard/Step2Page.jsx (1,054 lines) →
├── VariantMatrix.jsx                ← the grid of variant combinations
├── VariantRow.jsx                   ← a single editable variant row
├── SkuGenerator.jsx                 ← the SKU preview/generation UI
└── lib/variant-utils.js            ← deriveSkuFromName, buildAutoSku,
                                       makeVariantId, variantKey,
                                       normalizeExistingVariant,
                                       deriveColorSizeFromAttributes
                                       (currently defined inside the component body)
```

---

## 4. State Management Improvements

### CartContext — extract `findVariant`

Every mutation in `CartContext.js` re-implements the same lookup. Create one function at module level in `contexts/cart/cart-utils.js`:

```js
export function findCartItem(cart, productId, variantId) {
  return cart.find(
    item => item.product_id === productId && item.variant_id === variantId
  );
}
```

Then `addToCart`, `updateQty`, `removeItem`, and `syncCart` all call it. ~80 lines of duplication gone.

### Fix the `'shophub_'` Storage Keys

Create `/constants/storage-keys.js`:

```js
export const STORAGE_KEYS = {
  CART:       'zova_cart',
  SESSION_ID: 'zova_session_id',
  ANON_ID:    'zova_anon_id',
};
```

Import in `CartContext.js` and `utils/telemetry/analytics.js`. Old users' carts migrate automatically on first load with a one-time key migration check (read old key, write to new key, delete old key).

### FilterContext — Simplify the Ref Storm

`FilterContext.js` uses 4 refs to paper over stale closures because URL sync is reactive but filter state is not cleanly separated from URL state.

**Short-term:** consolidate `buildFilterUrl`, `parseParams`, and `buildParams` into a single codec in `contexts/filter/filter-codec.js`:

```js
export function filterStateToUrl(state) { ... }
export function urlToFilterState(url)   { ... }
```

This removes the 3-way duplication without changing the architecture.

**Medium-term:** replace the 8 `useState` calls with `useReducer`. Filter state is a classic reducer target — all transitions become explicit named actions.

### WishlistContext

Verify the wishlist fetch is not re-running on every `useWishlist()` call site. If it is, guard it with a `hasFetched` ref inside the context provider, not a dependency-array trick.

### Add `useMemo` to Context Values

Wrap the context value objects in `useMemo` in `CartContext` and `FilterContext` so that consumers only re-render when the slices they care about actually change, not on every provider render.

---

## 5. Performance Fixes

### A. Dynamic Imports for Heavy Modals

These are loaded on every page render even when they're never opened:

```js
// Before
import CategoriesModal from '@/components/catalog/browse/CategoriesModal';

// After
const CategoriesModal = dynamic(
  () => import('@/components/catalog/browse/CategoriesModal'),
  { ssr: false }
);
```

Apply to:
- `CategoriesModal.jsx` (562 lines)
- `MobileFilterDrawer.jsx` (220 lines)
- `StoreEntranceOverlay.jsx` (380 lines)

### B. Memoize ProductCard

`ProductCard` is rendered in a grid of up to 24 items. Every filter state change causes all 24 to re-render. Add `React.memo` with a comparator:

```js
export default React.memo(ProductCard, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.product.updated_at === next.product.updated_at
);
```

### C. ProductGrid Lazy Loading

`components/catalog/browse/LazyProductTile.jsx` already exists. Make sure it's using `IntersectionObserver` to defer rendering below-the-fold tiles, not just `loading="lazy"` on `<Image>` (which only defers the image fetch, not the component mount).

### D. Split `globals.css` (1,203 lines)

```
app/globals.css           ← @import "tailwindcss" + @theme tokens only (~80 lines)
app/components.css        ← .zova-* and .pdp-* utility classes
app/animations.css        ← @keyframes definitions
```

Import all three in `app/layout.js`. This makes the token file the single source of truth and lets you prune dead utility classes over time.

### E. Paystack Script Injection

`features/cart/checkout/useCartCheckout.js` injects the Paystack script by direct DOM manipulation. Use `next/script` with `strategy="lazyOnload"` in the checkout layout instead — avoids duplicate injection and gets proper lifecycle handling and error callbacks.

---

## 6. Step-by-Step Migration Plan

Each phase is independently deployable. Do not start phase 2 until phase 1 is shipped and tested.

---

### Phase 1 — Zero-Risk Cleanup (2–3 days)

These changes cannot break anything — they are pure moves and renames.

1. **Create `/constants/storage-keys.js`** — move `'shophub_cart'`, `'shophub_session_id'`, `'shophub_anon_id'`. Update `CartContext.js` and `analytics.js`.

2. **Create `/constants/filter-options.js`** — move `SIZE_OPTIONS` and `COLOR_OPTIONS` from `FilterSidebar.jsx` lines 8–15. Import back in `FilterSidebar` and `MobileFilterDrawer`.

3. **Create `/constants/shipping.js`** — move the hardcoded `2500`/`50000` shipping thresholds from `useCartCheckout.js`.

4. **Create `/constants/pagination.js`** — move `DEFAULT_LIMIT=24`, `MAX_LIMIT=100` from `features/catalog/server/products-route.js`.

5. **Extract `contexts/cart/cart-utils.js`** — pull `findCartItem` from the 4 duplicated variant-matching blocks in `CartContext.js`.

6. **Split `globals.css`** into tokens, component utilities, and animations files.

---

### Phase 2 — Design System Primitives (3–4 days)

Create `components/ui/` with base components. **Do not migrate existing components yet** — just build the primitives so they are available.

| Component | Variants |
|---|---|
| `Button.jsx` | `primary`, `secondary`, `outline`, `ghost`, `danger` |
| `Badge.jsx` | `promo`, `rank`, `trending`, `status` |
| `Chip.jsx` | `filter`, `category`, `size`, `color-swatch` |
| `Modal.jsx` | backdrop + panel + close button |
| `Spinner.jsx` | accessible loading indicator |
| `Skeleton.jsx` | generic shimmer (replaces inline animation in `ProductDetailPage`) |
| `EmptyState.jsx` | icon + title + description + optional CTA |
| `ConfirmModal.jsx` | uses `Modal.jsx`, adds confirm/cancel actions |
| `SearchInput.jsx` | input + clear button + optional debounce |

**Design rule:** No `style={{}}` in any `ui/` component. Use only Tailwind classes with CSS variable references like `bg-(--zova-primary-action)`.

---

### Phase 3 — Explode the God-Components (1 week)

Work through these one at a time. Each is self-contained.

1. **`ProductCard.jsx`** → `components/catalog/product-card/` folder. Swap inline sub-component definitions for real file imports.
2. **`AddressBook.jsx`** → Extract `AddressForm.jsx` first (also needed in checkout), then `AddressCard.jsx`, then `DeleteAddressModal.jsx`.
3. **`FilterSidebar.jsx`** → Extract `PriceBucketButton`, `CategoryChip` etc. into the `FilterSidebar/` folder. Move constants import to `/constants/filter-options.js`.
4. **`CategoriesModal.jsx`** → Add dynamic import first, then split tree rendering.
5. **`Step2Page.jsx`** → Extract the 6 utility functions to `variant-utils.js`, then extract `VariantRow.jsx`.

---

### Phase 4 — Inline Styles → Tailwind (1 week, ongoing)

Go file by file through the top 10 components and replace every `style={{ ... }}` with:

- A Tailwind class using the CSS variable: `border-(--zova-border)`
- OR a `data-*` attribute with a Tailwind variant: `data-[active=true]:border-(--zova-primary-action)`

Priority files:
1. `components/catalog/browse/FilterSidebar.jsx`
2. `features/catalog/ProductDetailPage.jsx`
3. `components/shared/MfaGate.jsx`
4. `components/catalog/ProductCard.jsx`

---

### Phase 5 — Context Refactors (3–4 days)

1. Extract `contexts/filter/filter-codec.js` with `filterStateToUrl` / `urlToFilterState`. Merge the 3 URL-parsing functions into the codec.
2. Convert `FilterContext` state from 8 `useState` calls to `useReducer`.
3. Add `useMemo` to `CartContext`'s context value object.

---

### Phase 6 — Performance & Dynamic Imports (2 days)

Apply the 5 performance fixes from section 5. Measure bundle size with `next build` and `@next/bundle-analyzer` before and after to confirm improvement.

---

## 7. Too Many Concerns in Single Files

Specific single-responsibility violations:

| File | Number of Jobs | What to split |
|---|---|---|
| `StoreClient.jsx` | 2 | Entrance gate logic + product browsing UI |
| `ProfileOverview.jsx` (391 lines) | 4 | Profile display, avatar upload, edit-mode toggle, value formatting |
| `LoginFormPanel.jsx` (408 lines) | 4 | Form rendering, validation logic, animation state, redirect logic — push most of this to `useLoginPage.js` which already exists |
| `Hero.jsx` (395 lines) | 3 | Slideshow timer, slide rendering, mobile/desktop layout |
| `AddressBook.jsx` (524 lines) | 4 | Form, list, delete confirmation, edit flow |

The pattern to follow is already in your codebase: `features/account/order-detail/` is correctly decomposed into `OrderHeaderCard`, `OrderItemsCard`, `OrderSummaryCard`, `OrderTimelineCard`, `useOrderDetail`, `orderDetail.utils`, and `orderDetail.constants`. Apply this same discipline to the files above.

---

## 8. Reusable Components You're Missing

These patterns appear in 3+ places but are re-implemented each time:

| Pattern | Where It Repeats | What to Create |
|---|---|---|
| Shimmer/skeleton loading | `ProductDetailPage`, `ProductCard`, `OrderHistory` | `ui/Skeleton.jsx` |
| Status badge (pending/active/cancelled) | Orders, Admin, Store Console | `ui/Badge.jsx` with a `status` variant map |
| Empty state (no products, no orders) | Wishlist, Orders, Admin tables | `ui/EmptyState.jsx` |
| Confirmation modal | Delete address, Cancel order, Admin actions | `ui/ConfirmModal.jsx` |
| Address form | `AddressBook` + checkout `CartSections` | `components/account/AddressForm.jsx` |
| Search input with clear button | `CategoriesModal`, Admin pages | `ui/SearchInput.jsx` |
| Paginated list | Orders, Admin Products, Store Products | `components/shared/PaginatedList.jsx` |

---

## 9. TypeScript: Now or Later?

**Recommendation: start now, migrate gradually — do not do a big-bang rewrite.**

### Why do it now

- You are about to refactor. Adding types while already touching files costs almost nothing extra. Adding them later means touching everything twice.
- The highest-risk areas — `CartContext` variant matching, `FilterContext` URL codec, the product wizard step logic — are exactly the places TypeScript catches bugs before runtime.
- You have 0 tests. TypeScript is the next-best protection when tests don't exist.
- `jsconfig.json` with path aliases means you are one `tsconfig.json` rename away from being TS-ready.

### The pragmatic migration approach (not a big-bang rewrite)

1. Add `tsconfig.json` alongside `jsconfig.json` — Next.js supports both simultaneously.
2. As you create new files during Phase 2 (the `ui/` components), create them as `.tsx`. These are simple components so types are easy.
3. As you touch existing files during Phases 3–5, rename them from `.jsx` → `.tsx` one at a time.
4. Never rename a file you are not already editing for another reason.

### Files to prioritize for TypeScript first

- All of `/constants/` — types are trivial, payoff is high (no more wrong key names)
- `/utils/catalog/bulk-pricing.js` — complex math, types prevent silent calculation errors
- `CartContext.js` and `FilterContext.js` — most complex state logic
- All `/hooks/` files — shared hooks have the highest reuse leverage

### Files to leave for last

- `globals.css` — not applicable
- Large feature pages (lots of work, lower benefit per line)
- Admin-only pages that rarely change

---

## 10. Priority Order (TL;DR)

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | Phase 1 constants cleanup | 0.5 days | Fixes brand naming, unblocks safe refactor |
| 2 | Extract `cart-utils.js` | 1 hour | Removes ~80 lines of duplication |
| 3 | Phase 2 `ui/` primitives | 3 days | Foundation for all component cleanup |
| 4 | Break `ProductCard.jsx` | 1 day | Most-rendered component, highest leverage |
| 5 | Break `AddressBook.jsx` + extract shared `AddressForm` | 1 day | Removes duplication with checkout |
| 6 | Dynamic imports for heavy modals | 2 hours | Immediate bundle size win |
| 7 | Start TypeScript in `constants/` + `hooks/` | 1 day | Safety net before deep refactor |
| 8 | `FilterContext` codec extraction | 1 day | Reduces 383-line complexity |
| 9 | Inline styles → Tailwind | 3 days | Consistency and tree-shaking |
| 10 | `React.memo` on ProductCard | 1 hour | Grid re-render performance |

---

The existing `features/{feature}/{Page, Sections, useHook, utils, constants}` pattern in `admin/` and `store-console/` is exactly right — apply it consistently everywhere. The `features/account/order-detail/` breakdown is the gold standard to follow across the entire codebase.

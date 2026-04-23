# Rendering, State, and Design System Policy

Date: 2026-04-18

## Rendering Defaults

This project uses Next.js App Router route groups to encode rendering intent:

- `app/(content)` uses `dynamic = 'force-static'`.
  Legal, policy, help, and marketing copy should be SSG/static unless it becomes CMS-driven.

- `app/(storefront)` uses `revalidate = 300`.
  Storefront/catalog shells can be ISR-style and periodically refreshed. Interactive islands still run on the client where needed.

- `app/(account)` uses `dynamic = 'force-dynamic'` and `fetchCache = 'force-no-store'`.
  Cart, wishlist, profile, orders, and account data are user-specific.

- `app/(store-console)` uses `dynamic = 'force-dynamic'` and `fetchCache = 'force-no-store'`.
  Vendor dashboards, inventory, orders, team, payouts, and product operations must stay request-specific.

- `app/(admin)` uses `dynamic = 'force-dynamic'` and `fetchCache = 'force-no-store'`.
  Admin pages are private operational views.

API routes remain backend contract endpoints for both the web app and future mobile app. Shared business logic should live under `features/*/server` and be called by `app/api/**/route.js`.

## Folder Responsibility Names

Use names that describe product responsibility, not implementation history:

- `features/storefront/home` owns the public homepage composition.
- `features/storefront/home/api` owns homepage/storefront merchandising fetch helpers.
- `features/catalog/browse` owns the `/shop` browsing experience and URL-driven filters.
- `features/catalog/api` owns reusable product/catalog API clients.
- `features/catalog/server` owns server-side catalog route logic.
- `features/store-console` owns seller/vendor operational workflows.
- `components/storefront/stores` owns public store profile UI.
- `components/store-console` owns seller/vendor console shell and dashboard UI.
- `components/catalog/browse` owns browse/filter/grid UI for product discovery.

Avoid reintroducing ambiguous buckets such as `features/home`, `features/shop`, `components/shop`, or a mixed-purpose `components/store`.

## State Management

Do not add Redux by default.

The current global state is small and domain-specific:

- cart
- wishlist
- filters
- location
- toast
- auth provider state

Contexts are appropriate for this level of state. Redux Toolkit becomes worth adding only when we need one or more of these:

- complex cross-feature state transitions
- offline-first mobile synchronization
- optimistic workflows shared across many pages
- normalized client cache with invalidation rules
- debugging/time-travel requirements for large client workflows

If Redux is introduced later, use Redux Toolkit with a per-request store provider and keep it out of React Server Components. Server data should still come from server rendering, route handlers, or feature API clients.

## Design System

Global design tokens live in `app/globals.css` and follow the supplied ZOVA brand package:

- Source: `/home/arinze/Downloads/ZOVA Brand Package/ZOVA Brand Identity Presentation.pdf`
- ZOVA Forest: `#2E6417`
- Gold Harvest: `#EC9C00`
- Soft Linen: `#F5F1EA`
- Onyx Black: `#191B19`
- Tagline: `Where trust meets the market`
- Product promise: `Verified Fashion, Made Easy`

Do not introduce a new color palette casually. New UI should use the tokens first, and existing redesigned storefront styling should remain visually stable.

The brand package names Panton as the primary typeface. Panton font files are not currently checked into the project, so `app/globals.css` defines a Panton-first fallback stack. If licensed Panton web fonts are added later, wire them into the same tokens instead of changing component-level styles.

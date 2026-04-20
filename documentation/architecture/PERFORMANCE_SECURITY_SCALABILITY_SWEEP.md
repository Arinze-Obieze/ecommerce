# Performance, Security, and Scalability Sweep

Date: 2026-04-18

## Current Direction

This project is a multi-vendor ecommerce platform with a future mobile client. The web app and mobile app should share stable `app/api/**` contracts, while reusable business logic lives outside route handlers.

## Implemented Guardrails

- Browser hardening headers are applied in the Supabase session middleware:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Origin-Agent-Cluster`
  - production-only HSTS
- CSP is rolled out as `Content-Security-Policy-Report-Only`, not enforcement.
  This collects violations without breaking checkout, Supabase auth, inline styles, dynamic images, or store-console flows.
- CSP reports are accepted at `/api/security/csp-report` with rate limiting and sanitized logging in non-production.
- Next.js config disables the `X-Powered-By` header and explicitly configures image optimization hosts.
- Public storefront/catalog APIs now use explicit public cache headers where safe.
- Private/error API responses use `no-store` by default.
- Public read APIs avoid broad `select('*')` patterns in the most exposed storefront endpoints.
- Public product listing input is bounded:
  - page and limit are clamped
  - sort mode is allowlisted
  - search text and slugs are normalized
  - catalog reads are rate-limited when Redis is available
- Signed upload object names use cryptographic UUID entropy instead of `Math.random()`.
- Upload signing maps file extensions from allowlisted MIME types instead of trusting the submitted filename.
- The architecture checker now fails if ambiguous legacy folders such as `features/home`, `features/shop`, `components/shop`, or mixed-purpose `components/store` return.

## API Contract Rules

- Public/mobile-safe APIs should return plain JSON with stable field names.
- Public read endpoints should expose intentional fields, not raw database rows.
- Personalized, account, admin, store-console, checkout, and payment endpoints should be dynamic and uncached.
- Public catalog/storefront endpoints may use short CDN/server cache windows.
- Mutations should stay rate-limited and should validate ownership on the server.

## Next Recommended Sweeps

- Move duplicated API response handling in older private routes to `utils/platform/api-response.js`.
- Add automated API contract tests for mobile-critical routes:
  - `/api/products`
  - `/api/products/[id]`
  - `/api/products/[id]/variants`
  - `/api/stores/[id]`
  - `/api/stores/top`
  - `/api/checkout`
- Add database indexes for common product browse filters if not already present:
  - `(is_active, moderation_status, stock_quantity)`
  - `(store_id, moderation_status)`
  - `(slug)`
  - category join indexes on `product_categories`.
- Review CSP reports from `/api/security/csp-report`, remove unnecessary allowances, then graduate to enforcing CSP once report noise is low.

# API Contracts

Date: 2026-04-18

This project serves the Next.js web app now and should also serve a mobile app later. Treat `app/api/**/route.js` as the public backend contract layer, not as web-only glue.

## Contract Rules

1. Keep mobile-safe API paths stable when possible:
   - `/api/products`
   - `/api/products/[id]`
   - `/api/stores/[id]`
   - `/api/stores/top`
   - `/api/account/*`
   - `/api/store/*`
   - `/api/checkout`

2. Route handlers should stay thin:
   - parse request input
   - authenticate and authorize
   - call feature/domain services
   - return a consistent JSON shape

3. Shared business rules should not live inside React components:
   - catalog fetching lives under `features/catalog/api`
   - storefront fetching lives under `features/storefront/home/api`
   - notification fetching/actions live under `features/notifications/api`
   - future server-side business logic should live under feature `services`, `queries`, or `domain` modules

4. Avoid web-only assumptions in backend responses:
   - do not return JSX, HTML, or CSS-specific data from API routes
   - use plain JSON with stable field names
   - make pagination, errors, and auth failures explicit

5. For future mobile auth:
   - keep cookie/session auth for web
   - design new token-based mobile auth behind the same business services
   - do not duplicate order, cart, checkout, or store ownership logic for mobile

## Preferred JSON Shape

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

Errors should use the same top-level shape:

```json
{
  "success": false,
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

This keeps the web client, mobile client, and admin/store console consuming the same backend contract.

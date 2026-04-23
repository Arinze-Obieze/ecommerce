# Supabase Service Role Assessment

Date: 2026-04-23

## Recommendation

Keep the Supabase service role key in this project, but narrow its use to truly privileged server-side work.

Recommended rule:

- Use `createClient()` for normal user-scoped requests and let RLS enforce data access.
- Use `createAdminClient()` or a service client only for privileged operations that cannot be expressed safely through the caller's session.
- Do not use the service role key as the default path for ordinary authenticated CRUD.

Why:

- The service role key bypasses RLS completely.
- Several current routes do manual ownership checks after bypassing RLS.
- That pattern can work, but one missed filter becomes a full-access bug instead of a contained authorization failure.

## Current Classification

### Keep

These are good or expected uses of the service role key because they perform privileged operations, background work, or platform-level writes.

- [utils/supabase/server.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/supabase/server.js:35)
  Dedicated admin client wrapper. Keep this pattern.
- [app/api/paystack/webhook/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/paystack/webhook/route.js:59)
  Third-party webhook processing, payout updates, escrow changes, and order state transitions are privileged backend operations.
- [app/api/checkout/cleanup/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/checkout/cleanup/route.js:5)
  Cron-style cleanup with its own secret. This is server-to-server automation and is a valid service-role use.
- [app/api/account/profile/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/account/profile/route.js:101)
  `auth.admin.updateUserById()` requires admin privileges.
- [app/api/auth/post-login-target/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/auth/post-login-target/route.js:18)
  Invite acceptance and user-profile repair are backend identity and membership tasks.
- [utils/store/auth.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/store/auth.js:42)
  Store membership resolution across protected records is acceptable as an internal authorization helper, though it should stay tightly scoped.
- [utils/admin/auth.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/admin/auth.js:28)
  Admin authorization helper. Expected privileged use.
- [utils/telemetry/server.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/telemetry/server.js:3)
  Server-side logging and analytics writes are platform writes, not user-owned data writes.
- [app/api/analytics/events/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/analytics/events/route.js:98)
  Centralized ingest endpoint writing analytics rows is a reasonable privileged backend pattern.
- [app/api/analytics/cart/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/analytics/cart/route.js:13)
  Same reasoning as analytics ingest; backend-owned event storage is acceptable.
- [scripts/database/check_schema.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/check_schema.js:5)
- [scripts/database/inspect_columns.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/inspect_columns.js:6)
- [scripts/database/migrate_schema.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/migrate_schema.js:5)
- [scripts/database/check_rpc.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/check_rpc.js:1)
- [scripts/database/check_order_items.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/check_order_items.js:1)
- [scripts/database/check_orders.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/check_orders.js:6)
- [scripts/database/apply_migrations.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/apply_migrations.js:7)
- [scripts/database/verify_checkout_schema.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/verify_checkout_schema.js:5)
  Local database inspection and migration helpers are valid service-role use cases.

### Refactor Soon

These routes currently authenticate the user, then switch to a service-role client for ordinary user-facing business logic. They work, but they rely on manual authorization after bypassing RLS.

- [app/api/checkout/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/checkout/route.js:8)
  User checkout path. This is high-risk because it reads products, creates orders, and writes related records in a core payment flow.
- [app/api/checkout/cancel/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/checkout/cancel/route.js:6)
  User-initiated cancel flow. It manually verifies ownership after bypassing RLS.
- [app/api/paystack/verify/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/paystack/verify/route.js:9)
  User-triggered payment verification. It is security-sensitive and currently uses service role for a user-scoped flow.
- [app/api/account/orders/[id]/cancel/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/account/orders/[id]/cancel/route.js:9)
  Account-level cancellation request flow should ideally run against user-scoped access plus narrowly privileged writes where needed.
- [app/api/reviews/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/reviews/route.js:61)
  Review creation and editing are user-facing actions. The verified-purchase lookup may need elevated read access, but the whole route should not depend on admin access end to end.
- [app/api/signup/route.js](/home/arinze/Desktop/Programming/Works/ecommerce/app/api/signup/route.js:18)
  Creating auth users and profiles with the service role key is broader than necessary. Prefer normal signup plus a post-signup server workflow or narrowly scoped privileged completion step.

Refactor direction for this bucket:

- Authenticate with `createClient()`.
- Use RLS for user-owned reads and writes.
- If one small step still requires elevation, isolate just that step behind a narrowly named helper instead of running the full route as admin.

### Safe For Now

These are acceptable for the moment because they are internal helpers or mixed-scope flows, but they should be watched to prevent the privileged boundary from spreading.

- [scripts/database/inspect_db.js](/home/arinze/Desktop/Programming/Works/ecommerce/scripts/database/inspect_db.js:7)
  Falls back to anon when service role is unavailable. Fine for diagnostics, but keep it local-only and never wire it into runtime code.
- [utils/store/auth.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/store/auth.js:42)
  Safe as an internal helper today, but it should not become a pattern for all store APIs to bypass RLS permanently.
- [utils/telemetry/server.js](/home/arinze/Desktop/Programming/Works/ecommerce/utils/telemetry/server.js:3)
  Safe because it is backend-only, but log payloads should remain sanitized and tightly controlled.

## Priority Order

If we refactor the risky bucket, this is the best sequence:

1. `app/api/checkout/route.js`
2. `app/api/paystack/verify/route.js`
3. `app/api/checkout/cancel/route.js`
4. `app/api/account/orders/[id]/cancel/route.js`
5. `app/api/reviews/route.js`
6. `app/api/signup/route.js`

Reasoning:

- Checkout and payment verification are the highest-impact paths.
- Cancellation flows are user-scoped and should be easier to move toward RLS.
- Reviews and signup matter, but they are less risky than payment-state transitions.

## Practical Boundary

Good reasons to use the service role key:

- Webhooks
- cron jobs
- auth admin operations
- background reconciliation
- internal analytics/event ingestion
- migration and inspection scripts
- privileged membership or invitation workflows

Bad default reasons to use the service role key:

- ordinary account pages
- user-owned CRUD
- customer checkout requests where the user is already authenticated
- any route that says "load row, then manually check `user_id`" unless elevation is truly unavoidable

## Bottom Line

The project should continue to have a service role key available, but the intended posture should be:

- privileged backend tool, not general-purpose data client
- isolated helper, not default route primitive
- exception-based use, not habit-based use

# Store Console + Moderation + Escrow Rollout (2026-03-20)

## Agreed Tasks

1. Store console expansion
- Add store dashboard sections: Overview, Products, Orders, Inventory, Analytics, Payouts, Settings, Team.
- Show role-aware navigation and access behavior.

2. Product upload + approval gate
- Store users can upload products to seller queue.
- Uploaded products stay hidden from public catalog until admin approval.
- Admin can approve or reject with reason.

3. Escrow-based settlement flow
- Checkout funds are collected by platform (Paystack).
- Funds are recorded as escrow hold for store(s), not instantly settled to store.
- Admin releases payout after delivery confirmation/QC.

4. Store cart-demand visibility
- Give stores demand signals such as products in carts / units in carts.
- Use privacy-safe aggregate metrics (no customer PII).

5. Admin escrow operations
- Add admin escrow queue with releasable items.
- Release payouts and keep auditability/status updates.

6. Notifications and lifecycle consistency
- Keep owner/manager/staff email lifecycle and order notifications.
- Keep post-login role/store redirect logic aligned.

## Implementation Order

1. Database migration (schema for moderation, escrow, payout accounts, cart demand events)
2. Backend APIs (store products, admin review, escrow queue/release, store analytics)
3. Dashboard/admin pages and nav wiring
4. Cart-demand event capture from frontend
5. Build verification and rollout notes

## Key Rules

- Public product feeds only expose approved/active listings.
- Store-submitted products default to non-public state until approved.
- Escrow release is admin-controlled and auditable.
- API role checks enforced server-side (not UI-only).

# Feature Status Checklist

Date: 2026-04-09

## Active To-Do

- [x] Add seller order detail page
- [x] Add seller fulfillment status actions
- [x] Add tracking reference and internal fulfillment notes history
- [x] Add cancellation workflow
- [ ] Add return request workflow
- [ ] Add refund visibility and status handling
- [ ] Harden reviews with verified-purchase and moderation controls
- [ ] Add full invitation lifecycle for non-existing team members
- [ ] Add richer notifications and lifecycle messaging
- [ ] Expand finance operations with reconciliation and exception tooling
- [ ] Cleanup duplicate wizard surfaces and remaining debug artifacts

## Done

- Checkout address capture and order-level shipping persistence
- Buyer order details page and order progress timeline
- Seller product edit flow
- Seller product duplicate, archive, unarchive, and delete actions
- Seller product resubmit-for-review flow
- Seller product detail screen
- Inventory adjustment workflow
- Variant-level inventory editing
- Low-stock shortcuts and restock actions
- Inventory adjustment history
- Store analytics, escrow, and payout visibility
- Team management for existing platform users
- Admin product review flow
- Admin escrow release flow

## Partial

### Seller orders management

- Order listing exists and now has a seller-facing order detail/action surface.
- Fulfillment status changes, tracking reference capture, and internal issue notes are being added through the new store order detail flow.
- Still missing broader workflows such as cancellation handling, returns, refunds, and deeper operational exception handling.

### Reviews

- Review submission and rendering exist.
- Missing stronger marketplace controls such as verified-purchase checks, moderation, edit/delete, and seller replies.

### Payouts

- Account setup and payout visibility exist.
- Missing deeper finance workflows such as reconciliation, disputes, and failure recovery tooling.

### Team management

- Adding members by email works when the user already exists.
- Missing invitation lifecycle support for non-existing users and pending invite management.

### Notifications

- Utilities exist and some flows may notify.
- There is no obvious complete in-app notification center or durable lifecycle messaging layer.

## Remaining

- Order issue handling from the store dashboard
- Return request workflow
- Refund status visibility
- Review moderation and anti-abuse protections
- Seller response to reviews
- Non-user invitation flow with invite acceptance
- Resend invite, pending invite state, and invite audit history
- Payout reconciliation and exception workflows
- Product cleanup and production hardening

## Recommended Priority Order

1. Seller order fulfillment actions
2. Returns, cancellations, and refunds
3. Reviews hardening
4. Team invite lifecycle
5. Notifications center and lifecycle messaging
6. Finance operations depth
7. Cleanup and hardening

## Notes

- This checklist reflects the current workspace as inspected on 2026-04-09.
- Some older gap-analysis notes in the repo appear outdated relative to newer implemented work.

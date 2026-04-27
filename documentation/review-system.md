# Review System

Covers the full lifecycle of buyer reviews: eligibility, submission, suspicion detection, moderation, and seller responses.

---

## Eligibility Rules

A buyer must satisfy **all four** conditions before a review is accepted:

| Rule | Detail |
|---|---|
| Verified purchase | The buyer must have a completed order containing the product (`order_items`) |
| Delivered status | That order's `fulfillment_status` must be `delivered` or `delivered_confirmed` |
| Review window | The order must have been delivered within the last **90 days** (uses `orders.delivered_at`, falls back to `buyer_confirmed_at`) |
| No self-review | The reviewer's `user_id` must not match the store owner's `user_id` (`products → stores.user_id`) |

One active review per buyer per product is enforced by a unique index on `(product_id, user_id) WHERE deleted_at IS NULL`.

---

## Submission Flow

**Endpoint:** `POST /api/reviews`

```
{ productId, rating (1–5), comment }
```

1. Auth check — must be signed in
2. Self-review guard — reject if reviewer owns the store
3. Verified purchase + window check — reject if no qualifying delivered order or window expired
4. Duplicate check — reject if an active review already exists (suggest edit instead)
5. Suspicion scoring — see section below
6. Save with `status: 'approved'` or `status: 'flagged'`
7. Return `{ ...review, flagged: boolean }`

---

## Suspicion Scoring

Signals are checked on every submission and re-checked on every edit. Reviews with a total score **≥ 2** are saved as `flagged` instead of `approved`. Fired signal keys are stored in `reviews.moderation_note` for admin visibility.

| Signal | Condition | Score |
|---|---|---|
| `short_comment` | Comment < 20 characters | +1 |
| `new_account` | Account created < 7 days ago | +1 |
| `very_new_account` | Account created < 3 days ago | +2 |
| `review_burst_mild` | 3–4 reviews submitted in the last 24 h | +1 |
| `review_burst` | 5+ reviews submitted in the last 24 h | +2 |

Account age is sourced from `user.created_at` on the auth session object — no extra DB query.

The buyer is shown a neutral message when flagged: *"Your review has been submitted and is pending a quick moderation check."* The flagging reason is never exposed to them.

---

## Review Statuses

| Status | Visible to public | Set by |
|---|---|---|
| `approved` | Yes | System (clean submission) or admin approval |
| `flagged` | No | System (suspicion score ≥ 2) |
| `rejected` | No | Admin |
| `hidden` | No | Seller (store console) |

The RLS policy on `reviews` filters public reads to `status = 'approved' AND deleted_at IS NULL`. No application-level filtering is required.

---

## Admin Moderation

**Page:** `/admin/reviews`
**API:** `GET /api/admin/reviews`, `PATCH /api/admin/reviews`

The page has three tabs — **Flagged** (work queue), **Approved**, **Rejected**.

Each flagged review card shows:
- Star rating, comment, verified purchase badge
- Suspicion signals that triggered flagging (`moderation_note`)
- Reviewer name and product link
- Submission timestamp

**Approve** → sets `status: 'approved'`, review goes live immediately.
**Reject** → prompts for an optional internal note, sets `status: 'rejected'`, remains hidden.

Both actions are written to the admin audit log (`admin_audit_logs`) with `REVIEW_APPROVED` or `REVIEW_REJECTED` as the action key.

Allowed admin roles: `SUPER_ADMIN`, `OPS_ADMIN`, `SUPPORT_ADMIN`.

---

## Seller Responses

**API:** `PATCH /api/store/reviews/[reviewId]`
**UI:** Store console → Product → Buyer Reviews (ProductReviewsManager)

Sellers (owner / manager / staff) can:
- Post a public reply (`seller_reply`) — visible on the product page under the review
- Set `status: 'hidden'` to suppress a review pending admin follow-up

Sellers **cannot** approve flagged reviews — that requires admin action.

When a seller reply is saved, a `review_reply_added` notification is sent to the buyer.

---

## Buyer Editing and Deletion

**Edit:** `PATCH /api/reviews` — `{ reviewId, rating?, comment? }`
- Suspicion scoring re-runs on any comment change; the review can be re-flagged
- `edited_at` is stamped on every successful edit

**Delete:** `DELETE /api/reviews?reviewId=...`
- Soft delete — sets `deleted_at`, does not remove the row
- The unique index (`WHERE deleted_at IS NULL`) allows the buyer to leave a fresh review after deleting

---

## Database

### Key columns on `reviews`

| Column | Purpose |
|---|---|
| `status` | `approved` / `flagged` / `rejected` / `hidden` |
| `is_verified_purchase` | Always `true` for reviews created via the API |
| `purchase_order_id` | FK to the qualifying delivered order |
| `moderation_note` | Comma-separated suspicion signal keys (admin-only) |
| `moderated_at / moderated_by` | Set when an admin acts on the review |
| `seller_reply / seller_replied_at` | Seller's public response |
| `edited_at` | Stamped on buyer edits |
| `deleted_at` | Soft-delete marker |

### `orders.delivered_at`

Added by migration `20260426_review_window_and_delivered_at.sql`.

- Set automatically by a `BEFORE UPDATE` trigger when `fulfillment_status` transitions to `'delivered'`
- Backfilled on migration from `order_fulfillment_updates` (earliest `status = 'delivered'` record), falling back to `buyer_confirmed_at`
- Used by the review window check: `(now - delivered_at) > 90 days` → reject

---

## File Map

| Path | Purpose |
|---|---|
| `app/api/reviews/route.js` | Buyer create / edit / delete |
| `app/api/store/reviews/[reviewId]/route.js` | Seller reply + hide |
| `app/api/admin/reviews/route.js` | Admin moderation queue (GET + PATCH) |
| `app/(admin)/admin/reviews/page.js` | Admin moderation UI |
| `components/store-console/ProductReviewsManager.jsx` | Seller reply UI |
| `features/catalog/ProductDetailPage.jsx` | Public review display + submission form |
| `supabase/migrations/20260426_review_window_and_delivered_at.sql` | `delivered_at` column + trigger + backfill |

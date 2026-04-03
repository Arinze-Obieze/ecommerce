-- Generic return policy content for every product page
-- Date: 2026-03-27

BEGIN;

CREATE TABLE IF NOT EXISTS public.platform_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_content_key
  ON public.platform_content (content_key);

INSERT INTO public.platform_content (content_key, title, description, data)
VALUES (
  'return_policy',
  'Returns & Refunds',
  'A standard return policy applied to every product on the catalog.',
  jsonb_build_object(
    'support_text', 'For help with a return, contact support before sending the item back.',
    'rows', jsonb_build_array(
      jsonb_build_object(
        'id', 'unused-with-tags',
        'scenario', 'Unused item with tags',
        'window', 'Within 30 days of delivery',
        'condition', 'Item must be unworn, unwashed, and in original packaging.',
        'resolution', 'Full refund or exchange',
        'notes', 'Original tags and proof of purchase are required.'
      ),
      jsonb_build_object(
        'id', 'damaged-or-wrong-item',
        'scenario', 'Damaged, defective, or wrong item',
        'window', 'Within 7 days of delivery',
        'condition', 'Share photos and report the issue after delivery.',
        'resolution', 'Full refund or replacement',
        'notes', 'Return shipping is covered when the issue is verified.'
      ),
      jsonb_build_object(
        'id', 'change-of-mind',
        'scenario', 'Change of mind',
        'window', 'Within 14 days of delivery',
        'condition', 'Item must be unused and still resaleable.',
        'resolution', 'Store credit or exchange',
        'notes', 'Shipping fees may be deducted where applicable.'
      )
    )
  )
)
ON CONFLICT (content_key) DO NOTHING;

COMMIT;

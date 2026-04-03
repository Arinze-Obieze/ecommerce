BEGIN;

CREATE TABLE IF NOT EXISTS public.product_creation_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_step integer NOT NULL DEFAULT 1,
  wizard_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_creation_drafts_store_user_idx
  ON public.product_creation_drafts (store_id, user_id);

CREATE INDEX IF NOT EXISTS product_creation_drafts_store_updated_idx
  ON public.product_creation_drafts (store_id, updated_at DESC);

COMMENT ON TABLE public.product_creation_drafts IS
  'Autosaved wizard drafts for store product creation, including persisted step state and draft image references.';

COMMENT ON COLUMN public.product_creation_drafts.wizard_state IS
  'JSON snapshot of the product creation wizard excluding transient browser-only blobs.';

COMMENT ON COLUMN public.product_creation_drafts.image_manifest IS
  'Map of wizard image slot keys to persisted draft image metadata in storage.';

COMMIT;

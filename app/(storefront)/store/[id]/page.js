import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import StoreClient from '@/components/storefront/stores/StoreClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Try fetching by ID or Slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let query = supabase.from('stores').select('name, description');
  
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }
  
  const { data: store } = await query.single();
  
  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }
  
  return {
    title: `${store.name} | ZOVA`,
    description: store.description || `Shop the latest from ${store.name} on ZOVA.`,
  };
}

export default async function StorePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Try fetching by ID or Slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let query = supabase.from('stores').select('*');
  
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data: store, error } = await query.single();

  if (error || !store) {
    notFound();
  }

  return <StoreClient store={store} />;
}

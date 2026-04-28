import MoodPage from '@/features/storefront/MoodPage';

export default async function MoodRoute({ params }) {
  const resolvedParams = await params;
  return <MoodPage slug={resolvedParams?.slug || ''} />;
}

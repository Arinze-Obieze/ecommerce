import BrowseCategoryPage from '@/features/catalog/browse/BrowseCategoryPage';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const title = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Shop`,
    description: `Shop the latest ${title} collection.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  return <BrowseCategoryPage category={category} />;
}

import BrowseClient from '@/components/catalog/browse/BrowseClient';

export default async function BrowseCategoryPage({ category }) {
  return <BrowseClient initialCategory={category} />;
}

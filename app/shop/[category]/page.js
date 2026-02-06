import ShopClient from "@/components/ShopClient";

export async function generateMetadata({ params }) {
  const { category } = await params;
  
  // Convert slug to readable title (e.g., 'men-clothing' -> 'Men Clothing')
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
  return <ShopClient initialCategory={category} />;
}

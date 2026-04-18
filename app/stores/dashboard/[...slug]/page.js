import { redirect } from 'next/navigation';

export default async function StoresDashboardPathRedirect(props) {
  const params = await props.params;
  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const suffix = slug.length ? `/${slug.join('/')}` : '';
  redirect(`/store/dashboard${suffix}`);
}

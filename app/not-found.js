import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--zova-linen) px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-9xl font-bold text-(--zova-border)">404</div>
        <h1 className="mb-3 text-3xl font-bold text-(--zova-ink)">Page Not Found</h1>
        <p className="mb-8 text-(--zova-text-muted)">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full rounded-lg bg-(--zova-primary-action) px-6 py-3 font-medium text-white transition-colors hover:bg-(--zova-primary-action-hover)"
          >
            Go back home
          </Link>
          <Link
            href="/shop"
            className="inline-block w-full rounded-lg border-2 border-(--zova-border) px-6 py-3 font-medium text-(--zova-ink) transition-colors hover:bg-(--zova-surface-alt)"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}

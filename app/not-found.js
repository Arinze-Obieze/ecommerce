import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-blue-100 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back home
          </Link>
          <Link
            href="/products"
            className="inline-block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
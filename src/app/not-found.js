import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
        Sorry, we couldn't find that page.
      </p>
      <Link href="/">
        <a className="mt-6 px-5 py-2 bg-primary text-white rounded hover:bg-primary-dark">
          Go Back Home
        </a>
      </Link>
    </div>
  );
} 
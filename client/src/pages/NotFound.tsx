import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl font-black text-gray-900 dark:text-gray-100">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        Back to Home
      </Link>
    </div>
  );
}

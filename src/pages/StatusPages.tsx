import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-4 text-gray-600">Page not found.</p>
      <Link to="/" className="text-brand-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold">403</h1>
      <p className="mb-4 text-gray-600">You don't have permission to view this page.</p>
      <Link to="/" className="text-brand-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}

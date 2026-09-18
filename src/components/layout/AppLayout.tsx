import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
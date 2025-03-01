import { Link, Outlet } from "@tanstack/react-router";

import { Suspense } from "react";
import { useAuth } from "contexts/AuthContext";

export function Root() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
                Home
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to={`/profile/${user?.id}`} className="text-gray-700 hover:text-gray-900">
                    {user?.email}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth/login" className="text-gray-700 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

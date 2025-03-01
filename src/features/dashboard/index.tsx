import { Link, useLoaderData, useSearch } from "@tanstack/react-router";

import { Icons } from "assets/icons";
import { motion } from "framer-motion";
import { navigateTo } from "utils/navigation/navigate";
import { useAuth } from "../../lib/auth";
import { useAuthStore } from "store/states";

export function DashboardRoute() {
  const { stats, view, sort } = useLoaderData();
  const search = useSearch();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.email}</p>
          </div>
          <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4 space-x-4">
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Link
                search={{ ...search, view: "grid" }}
                className={`px-3 py-2 rounded-md ${
                  view === "grid" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Grid
              </Link>
              <Link
                search={{ ...search, view: "list" }}
                className={`px-3 py-2 rounded-md ${
                  view === "list" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                List
              </Link>
            </div>
            {/* Sort Toggle */}
            <Link
              search={{ ...search, sort: sort === "asc" ? "desc" : "asc" }}
              className="px-3 py-2 rounded-md text-gray-500 hover:text-gray-700"
            >
              Sort {sort === "asc" ? "↑" : "↓"}
            </Link>
            <button
              onClick={() => logout()}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <motion.div layout className={`grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
        {["users", "posts", "comments"].map((item) => (
          <motion.div
            key={item}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white overflow-hidden shadow rounded-lg ${
              view === "list" ? "flex items-center justify-between p-4" : ""
            }`}
          >
            <div className={view === "grid" ? "px-4 py-5 sm:p-6" : ""}>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total {item.charAt(0).toUpperCase() + item.slice(1)}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats[item]}</dd>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

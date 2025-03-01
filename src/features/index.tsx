import { Outlet } from "@tanstack/react-router";
import { useAuth } from "contexts/AuthContext";

export function IndexRoute() {
  return (
    <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
      <p className="mt-2 text-gray-600">This is the home page of your application.</p>
    </div>
  );
}

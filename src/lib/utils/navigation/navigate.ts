import { router, type NavigateOptions as RouterNavigateOptions } from "lib/vendors";

interface NavigateOptions {
  state?: Record<string, unknown>;
  replace?: boolean;
  params?: Record<string, string | number>;
  search?: Record<string, string>;
  hash?: string;
}

// Non-hook version for use outside components
export const navigateTo = (path: string, options?: NavigateOptions) => {
  const { state, replace = false, params = {}, search, hash } = options || {};

  if (path === "back") {
    router.history.back();
    return;
  }

  if (path === "forward") {
    router.history.forward();
    return;
  }

  // Format path with params (replace :paramName with actual values)
  const formattedPath = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
    path
  );

  // Type assertion for router path format
  const routerOptions: RouterNavigateOptions = {
    to: `/${formattedPath.replace(/^\/+/, "")}`,
    replace,
    state,
    search: search as RouterNavigateOptions["search"],
    hash,
  };

  return router.navigate(routerOptions);
};

// Hook version for use inside components
export const useNavigateTo = () => navigateTo;

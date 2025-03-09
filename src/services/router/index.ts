import { createElement, lazy, Suspense, type FC } from "@/lib/vendors";
import { createBrowserRouter, Navigate, Outlet } from "@/lib/vendors";
import Layout from "@/components/layout";
import { routes, type RouteConfig } from "@/routes";
import Loading from "@/components/common/loading";
import { store } from "@/services/store";

// Higher-order component for protected routes
const withProtection = (Component: FC, requiresAdmin: boolean = false): FC => {
  const AuthRoute: FC = (props) => {
    const auth = store.auth.get();
    const isAuthenticated = auth.isLoggedIn;
    const isAdmin = auth.isAdmin;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      return createElement(Navigate, { to: "/login", replace: true });
    }
    
    // If route requires admin access, check if user is admin
    if (requiresAdmin && !isAdmin) {
      return createElement(Navigate, { to: "/", replace: true });
    }
    
    // User is authenticated and has required permissions
    return createElement(Component, props);
  };
  return AuthRoute;
};

// Higher-order component for lazy loading
const withLazyLoading = (importFunc: () => Promise<{ default: FC }>): FC => {
  const LazyComponent = lazy(importFunc);
  const LazyLoadedRoute: FC = (props) => {
    return createElement(Suspense, { fallback: createElement(Loading) }, createElement(LazyComponent, props));
  };
  return LazyLoadedRoute;
};

// Create router configuration
const createRouter = (routes: RouteConfig[]) => {
  return createBrowserRouter([
    {
      path: "/",
      element: createElement(Outlet),
      children: routes.map(({ path, component, auth: requiresAuth, adminOnly, isLazy, layoutProps }) => {
        const LoadedComponent = isLazy ? withLazyLoading(component) : (component() as unknown as FC);
        const AuthComponent = requiresAuth ? withProtection(LoadedComponent, adminOnly) : LoadedComponent;

        return {
          path,
          element: createElement(Layout, layoutProps, createElement(AuthComponent)),
        };
      }),
    },
  ]);
};

export const router = createRouter(routes);

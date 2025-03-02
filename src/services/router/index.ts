import { createElement, lazy, Suspense, type FC } from "@/lib/vendors";
import { createBrowserRouter, Navigate, Outlet } from "@/lib/vendors";
import Layout from "@/components/layout";
import { routes, type RouteConfig } from "@/routes";
import Loading from "@/components/common/loading";

// Higher-order component for protected routes
const withProtection = (Component: FC): FC => {
  const AuthRoute: FC = (props) => {
    // const { isAuthenticated } = useAuthStore();
    const isAuthenticated = true;
    return isAuthenticated ? createElement(Component, props) : createElement(Navigate, { to: "/login", replace: true });
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
      children: routes.map(({ path, component, auth: requiresAuth, isLazy, layoutProps }) => {
        const LoadedComponent = isLazy ? withLazyLoading(component) : (component() as unknown as FC);
        const AuthComponent = requiresAuth ? withProtection(LoadedComponent) : LoadedComponent;

        return {
          path,
          element: createElement(Layout, layoutProps, createElement(AuthComponent)),
        };
      }),
    },
  ]);
};

export const router = createRouter(routes);

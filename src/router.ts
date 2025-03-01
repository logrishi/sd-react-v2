import { RootRoute, Route, Router, lazyRouteComponent, redirect } from '@tanstack/react-router'

import { Link } from 'react-router-dom'
import { Root } from 'features/_root'
import { authGuard } from 'utils/auth/guards'
import { useAuth } from 'contexts/AuthContext'
import { z } from 'zod'

// Define the root route with error boundary
const rootRoute = new RootRoute({
  component: Root,
  validateSearch: z.object({
    theme: z.enum(['light', 'dark']).optional(),
  }),
  errorComponent: () => (
    <div className="p-4">
      <h1 className="text-red-500 text-2xl">Something went wrong!</h1>
      <Link to="/" className="text-blue-500 hover:underline">
        Go Home
      </Link>
    </div>
  ),
})

// Index route with suspense
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./features/index').then(d => ({
    component: d.IndexRoute
  }))),
})

// Dashboard route with auth guard, loader and search params
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  validateSearch: z.object({
    view: z.enum(['grid', 'list']).optional().default('grid'),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    filter: z.string().optional(),
  }),
  beforeLoad: authGuard,
  component: lazyRouteComponent(() => import('./features/dashboard').then(d => ({
    component: d.DashboardRoute
  }))),
  loader: async ({ search }) => {
    // Simulate data fetching with search params
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      stats: {
        users: 100,
        posts: 50,
        comments: 200,
      },
      view: search.view,
      sort: search.sort,
      filter: search.filter,
    }
  },
  pendingComponent: () => (
    <div className="p-4">Loading dashboard...</div>
  ),
})

// Auth routes
const authRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: lazyRouteComponent(() => import('./features/auth/layout').then(d => ({
    component: d.AuthLayout
  }))),
})

const loginRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'login',
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: lazyRouteComponent(() => import('./features/auth/login').then(d => ({
    component: d.LoginRoute
  }))),
  beforeLoad: () => {
    if (useAuth.getState().isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

const registerRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'register',
  component: lazyRouteComponent(() => import('./features/auth/register').then(d => ({
    component: d.RegisterRoute
  }))),
})

// Profile route with params
const profileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'profile/$userId',
  beforeLoad: authGuard,
  component: lazyRouteComponent(() => import('./features/profile').then(d => ({
    component: d.ProfileRoute
  }))),
  loader: async ({ params: { userId } }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      user: {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      },
    }
  },
})

// Not found route
const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => (
    <div className="p-4">
      <h1 className="text-2xl">404 - Page Not Found</h1>
      <Link to="/" className="text-blue-500 hover:underline">
        Go Home
      </Link>
    </div>
  ),
})

// Create and configure the router
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  authRoute.addChildren([
    loginRoute,
    registerRoute,
  ]),
  profileRoute,
  notFoundRoute,
])

export const router = new Router({
  routeTree,
  defaultPreload: 'intent',
  // Enable route transitions
  defaultPreloadDelay: 100,
  defaultPendingMs: 1000,
  defaultPendingMinMs: 500,
  // Enable default error boundaries
  defaultErrorComponent: ({ error }) => (
    <div className="p-4 text-red-500">
      <h1>Error: {error.message}</h1>
    </div>
  ),
  // Enable default pending components with transition
  defaultPendingComponent: () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  ),
})

// Register your router for maximum type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

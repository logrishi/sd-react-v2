import { type FC } from "@/lib/vendors";

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: FC }>;
  auth?: boolean;
  isLazy?: boolean;
  layoutProps?: {
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
    showBottomTabs?: boolean;
  };
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("@/features/home"),
    isLazy: true,
  },
  {
    path: "/login",
    component: () => import("@/features/auth/login"),
    isLazy: true,
  },
  {
    path: "/signup",
    component: () => import("@/features/auth/signup"),
    isLazy: true,
  },
  {
    path: "/forgot-password",
    component: () => import("@/features/auth/forgot-password"),
    isLazy: true,
  },
  {
    path: "/orders",
    component: () => import("@/features/orders"),
    auth: true,
    isLazy: true,
  },
  {
    path: "/profile",
    component: () => import("@/features/profile"),
    auth: true,
    isLazy: true,
  },
];

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
  // {
  //   path: "/login",
  //   component: () => import("@/ui/pages/auth/login"),
  //   isLazy: true,
  // },
  // {
  //   path: "/signup",
  //   component: () => import("@/ui/pages/auth/signup"),
  //   isLazy: true,
  // },
  // {
  //   path: "/forgot-password",
  //   component: () => import("@/ui/pages/auth/forgot-password"),
  //   isLazy: true,
  // },
  // {
  //   path: "/orders",
  //   component: () => import("@/ui/pages/orders"),
  //   auth: true,
  //   isLazy: true,
  // },
  // {
  //   path: "/profile",
  //   component: () => import("@/ui/pages/profile"),
  //   auth: true,
  //   isLazy: true,
  // },
];

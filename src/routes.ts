import { type FC } from "@/lib/vendors";
import { type ComponentType } from "react";

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: FC }>;
  auth?: boolean;
  isLazy?: boolean;
  layoutProps?: {
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
    showBottomTabs?: boolean;
    showBackButton?: boolean;
    headerTitle?: string;
    headerRightIcons?: string[];
    banner?: {
      // Component to render in the banner
      component: () => Promise<{ default: ComponentType<any> } | ComponentType<any>>;
      // Banner configuration
      config?: {
        position?: "bottom" | "bottom-with-tabs" | "center" | "top";
        showBackdrop?: boolean;
        dismissible?: boolean;
        persistent?: boolean;
        showCloseButton?: boolean;
      };
    };
  };
}

export const routes: RouteConfig[] = [
  {
    path: "/bookmarks",
    component: () => import("@/features/bookmark"),
    isLazy: true,
    layoutProps: {
      headerTitle: "My Bookmarks",
    },
  },
  {
    path: "/",
    component: () => import("@/features/home"),
    isLazy: true,
    layoutProps: {
      showBottomTabs: true,
      banner: {
        component: () => import("@/components/common/subscribe-sheet").then((m) => m.SubscribeSheet),
        config: {
          position: "bottom-with-tabs",
          showBackdrop: false,
          dismissible: false,
          persistent: true,
          showCloseButton: false,
        },
      },
    },
  },
  {
    path: "/product/:id",
    component: () => import("@/features/home/components/book-details"),
    isLazy: true,
    layoutProps: {
      showBackButton: true,
      headerTitle: "Book Details",
      headerRightIcons: ["bookmarks", "cart"],
      showBottomTabs: false,
    },
  },
  {
    path: "/login",
    component: () => import("@/features/auth/login"),
    isLazy: true,
    layoutProps: {
      showBackButton: false,
      headerTitle: "Login",
      headerRightIcons: [],
      showBottomTabs: true,
    },
  },
  {
    path: "/signup",
    component: () => import("@/features/auth/signup"),
    isLazy: true,
    layoutProps: {
      showBackButton: false,
      headerTitle: "Sign Up",
      headerRightIcons: [],
      showBottomTabs: true,
    },
  },
  {
    path: "/password-reset",
    component: () => import("@/features/auth/password-reset"),
    isLazy: true,
    layoutProps: {
      showBackButton: true,
      headerTitle: "Reset Password",
      headerRightIcons: [],
      showBottomTabs: false,
    },
  },
  {
    path: "/orders",
    component: () => import("@/features/orders"),
    auth: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "My Orders",
    },
  },
  {
    path: "/profile",
    component: () => import("@/features/profile"),
    auth: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "My Profile",
    },
  },
  {
    path: "/dashboard",
    component: () => import("@/features/dashboard"),
    auth: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "Dashboard",
    },
  },
];

import { type FC } from "@/lib/vendors";
import { type ComponentType } from "react";

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: FC }>;
  auth?: boolean;
  adminOnly?: boolean;
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
    path: "/notifications",
    component: () => import("@/features/notifications"),
    isLazy: true,
    layoutProps: {
      headerTitle: "Notifications",
      showBackButton: true,
    },
  },
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
    path: "/book/:id",
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
    path: "/admin/dashboard",
    component: () => import("@/features/dashboard"),
    auth: true,
    adminOnly: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "Dashboard",
    },
  },
  {
    path: "/admin/add-book",
    component: () => import("@/features/admin/add-book"),
    auth: true,
    adminOnly: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "Add Book",
    },
  },
  {
    path: "/admin/edit-book/:id",
    component: () => import("@/features/admin/add-book"),
    auth: true,
    adminOnly: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "Edit Book",
    },
  },
  {
    path: "/admin/books",
    component: () => import("@/features/admin/books"),
    auth: true,
    adminOnly: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "Manage Books",
    },
  },
];

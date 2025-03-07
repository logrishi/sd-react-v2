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
    showBackButton?: boolean;
    headerTitle?: string;
    headerRightIcons?: string[];
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
    layoutProps: {},
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
      showBottomTabs: false,
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
      showBottomTabs: false,
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
];

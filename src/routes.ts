import { type FC } from "@/lib/vendors";

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: FC }>;
  auth?: boolean;
  adminOnly?: boolean;
  isLazy?: boolean;
  layoutProps?: {
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
    showBottomTabs?: boolean;
    showBackButton?: boolean;
    headerTitle?: string;
    headerRightIcons?: string[];
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
      showBottomTabs: false,
    },
  },
  {
    path: "/privacy",
    component: () => import("@/features/privacy"),
    isLazy: true,
    layoutProps: {
      headerTitle: "Privacy Policy",
      showBackButton: true,
      showBottomTabs: false,
    },
  },

  //no ui just here for using useNavigate
  {
    path: "/native",
    component: () => import("@/features/native-actions"),
    isLazy: true,
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
    path: "/status/:txnId",
    component: () => import("@/features/pay/status"),
    auth: true,
    isLazy: true,
    layoutProps: {
      headerTitle: "",
      showHeader: false,
      showFooter: false,
      showBottomTabs: false,
      showLeftSidebar: false,
      showRightSidebar: false,
      showBackButton: false,
      headerRightIcons: [],
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

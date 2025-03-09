export interface NavigationItem {
  icon?: string;
  label?: string;
  path: string;
  requireAuth?: boolean;
  position: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

export const navigationConfig: NavigationItem[] = [
  {
    icon: "Home",
    label: "Home",
    path: "/",
    position: {
      bottom: true,
      left: true,
    },
  },
  {
    icon: "Bookmark",
    label: "Bookmarks",
    path: "/bookmarks",
    requireAuth: true,
    position: {
      bottom: true,
      left: true,
    },
  },
  {
    icon: "User",
    label: "Profile",
    path: "/profile",
    position: {
      bottom: true,
      left: true,
    },
  },
];

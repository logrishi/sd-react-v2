import { ShoppingCart, Bell, User, Bookmark } from "@/assets/icons";
import type { LucideIcon } from "lucide-react";

export interface HeaderIcon {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

export const headerIcons: HeaderIcon[] = [
  {
    id: "bookmarks",
    icon: Bookmark,
    label: "Bookmarks",
    href: "/bookmarks",
  },
  {
    id: "cart",
    icon: ShoppingCart,
    label: "Cart",
    href: "/cart",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
  },
  {
    id: "profile",
    icon: User,
    label: "Profile",
    href: "/profile",
  },
];

import { ShoppingCart, Bell, User, Bookmark, ShieldUser } from "@/assets/icons";
import type { LucideIcon } from "lucide-react";

export interface HeaderIcon {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

export const headerIcons: HeaderIcon[] = [
  // {
  //   id: "cart",
  //   icon: ShoppingCart,
  //   label: "Cart",
  //   href: "/cart",
  // },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
  },
  {
    id: "admin",
    icon: ShieldUser,
    label: "Admin",
    href: "/admin/dashboard",
  },
];

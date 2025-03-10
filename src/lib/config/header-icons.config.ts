import { ShoppingCart, Bell, User, Bookmark, ShieldUser, Sun, Moon, type LucideIcon } from "@/assets/icons";

export interface HeaderIcon {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  dynamicIcon?: () => LucideIcon;
}

export const headerIcons: HeaderIcon[] = [
  {
    id: "theme",
    icon: Sun, // Default icon, will be overridden by dynamicIcon
    label: "Toggle Theme",
    dynamicIcon: () => Sun, // This will be handled in the Header component
    onClick: () => {}, // This will be handled in the Header component
  },
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

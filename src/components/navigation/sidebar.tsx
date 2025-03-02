import { type FC } from "@/lib/vendors";
import { useLocation } from "@/lib/vendors";
import { type NavigationItem } from "@/lib/config/navigation.config";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils/utils";

interface SidebarProps {
  config?: NavigationItem[];
  activePath?: string;
  onNavigate?: (path: string) => void;
  orientation: "left" | "right";
  title?: string;
}

export const Sidebar: FC<SidebarProps> = ({
  config = [],
  activePath: propActivePath,
  onNavigate,
  orientation,
  title,
}) => {
  const location = useLocation();
  const currentPath = propActivePath || location.pathname;

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  const items = config.filter((item) => (orientation === "left" ? item.position?.left : item.position?.right));

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-background z-30 w-sidebar",
        orientation === "left" ? "fixed left-0 border-r hidden lg:block" : "fixed right-0 border-l hidden lg:block"
      )}
    >
      {title && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            icon={item.icon}
            isActive={currentPath === item.path}
            variant="side"
            onClick={() => handleNavigate(item.path)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

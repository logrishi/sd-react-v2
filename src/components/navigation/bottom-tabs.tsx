import { type FC } from "@/lib/vendors";
import { useLocation } from "@/lib/vendors";
import { type NavigationItem } from "@/lib/config/navigation.config";
import { NavLink } from "./nav-link";

interface BottomTabsProps {
  config?: NavigationItem[];
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const BottomTabs: FC<BottomTabsProps> = ({ config = [], activePath: propActivePath, onNavigate }) => {
  const location = useLocation();
  const currentPath = propActivePath || location.pathname;

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  const bottomItems = config.filter((item) => item.position?.bottom);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe block lg:hidden">
      <div className="container mx-auto">
        <nav className="flex items-center justify-around h-16 text-black">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              icon={item.icon}
              isActive={currentPath === item.path}
              variant="bottom"
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default BottomTabs;

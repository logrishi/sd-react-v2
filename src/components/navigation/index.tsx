import { type FC } from "@/lib/vendors";
import { BottomTabs } from "./bottom-tabs";
import { Sidebar } from "./sidebar";
import { NavigationItem } from "@/lib/config/navigation.config";

interface NavigationProps {
  config: NavigationItem[];
  variant?: "left" | "right" | "bottom";
  activePath?: string;
  onNavigate?: (path: string) => void;
  children?: React.ReactNode; // For banner content
}

const Navigation: FC<NavigationProps> = ({ 
  config, 
  variant = "left", 
  activePath, 
  onNavigate,
  children 
}) => {
  const props = { config, activePath, onNavigate };

  switch (variant) {
    case "left":
      return <Sidebar {...props} orientation="left" />;
    case "right":
      return <Sidebar {...props} orientation="right" />;
    case "bottom":
      return <BottomTabs {...props} children={children} />;
    default:
      return null;
  }
};

// Export the Navigation component as default
export default Navigation;

// Export individual components for direct use
export { Navigation, BottomTabs, Sidebar };

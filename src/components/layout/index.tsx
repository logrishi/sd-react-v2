import { type FC, Outlet, type ReactNode } from "@/lib/vendors";
import { APP_NAME, BOTTOM_CONTENT_PADDING } from "@/lib/utils/constants";
import Navigation from "../navigation";
import { navigationConfig } from "@/lib/config/navigation.config";
import { cn } from "@/lib/utils/utils";
import { Header } from "@/components/common/header";
import { useLocation } from "react-router-dom";
import { routes } from "@/routes";
import { headerIcons } from "@/lib/config/header-icons.config";
import { Footer } from "../common/footer";

interface LayoutProps {
  children?: ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showBottomTabs?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  headerTitle?: string;
  headerRightIcons?: string[];
}

export const Layout: FC<LayoutProps> = ({
  children,
  showLeftSidebar = true,
  showRightSidebar = false,
  showBottomTabs = true,
  showHeader = true,
  showFooter = true,
  showBackButton: propShowBackButton,
  headerTitle: propHeaderTitle,
  headerRightIcons: propHeaderRightIcons,
}) => {
  const location = useLocation();
  const currentRoute = routes.find((route) => {
    // Convert route path to regex to handle dynamic segments
    const routeRegex = new RegExp(`^${route.path.replace(/:[^/]+/g, "[^/]+")}$`);
    return routeRegex.test(location.pathname);
  });

  // Use route config or prop values, with props taking precedence
  const showBackButton =
    propShowBackButton ??
    currentRoute?.layoutProps?.showBackButton ??
    !navigationConfig.some((item) => item.path === location.pathname);
  const headerTitle = propHeaderTitle ?? currentRoute?.layoutProps?.headerTitle ?? APP_NAME;
  const headerRightIcons =
    propHeaderRightIcons ?? currentRoute?.layoutProps?.headerRightIcons ?? headerIcons.map((icon) => icon.id);
  const content = (
    <div className="flex flex-col min-h-screen bg-background layout-sidebar">
      {/* Header */}
      {showHeader && <Header showBackButton={showBackButton} title={headerTitle} rightIcons={headerRightIcons} />}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {showLeftSidebar && <Navigation config={navigationConfig} variant="left" />}

        {/* Main Content + Footer */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 lg:transition-[margin] duration-300 max-lg:!m-0",
            showLeftSidebar && "lg:ml-sidebar",
            showRightSidebar && "lg:mr-sidebar"
          )}
        >
          <main
            className="flex-1 overflow-y-auto"
            style={{
              // Add padding for bottom tabs on mobile
              paddingBottom: showBottomTabs ? "80px" : undefined,
            }}
          >
            <div className="app-container">{children ? children : <Outlet />}</div>
          </main>

          {/* Desktop Footer */}
          {showFooter && <Footer />}
        </div>

        {/* Right Sidebar */}
        {showRightSidebar && <Navigation config={navigationConfig} variant="right" />}
      </div>

      {/* Bottom Tabs (Mobile & Tablet) */}
      {showBottomTabs && (
        <div className="lg:hidden border-t bg-background fixed bottom-0 left-0 right-0 z-[70]">
          <div className="app-container py-2">
            <Navigation config={navigationConfig} variant="bottom" />
          </div>
        </div>
      )}
    </div>
  );

  return content;
};

export default Layout;

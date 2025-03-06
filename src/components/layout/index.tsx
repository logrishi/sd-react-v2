import { type FC, Outlet, type ReactNode } from "@/lib/vendors";
import { APP_NAME, BOTTOM_CONTENT_PADDING } from "@/lib/utils/constants";
import Navigation from "../navigation";
import { navigationConfig } from "@/lib/config/navigation.config";
import { cn } from "@/lib/utils/utils";
import { Header } from "@/components/common/header";
import { useLocation } from "react-router-dom";
import { routes } from "@/routes";
import { headerIcons } from "@/lib/config/header-icons.config";

interface LayoutProps {
  children?: ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showBottomTabs?: boolean;
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
  return (
    <div className="flex flex-col min-h-screen bg-background layout-sidebar">
      {/* Header */}
      <Header showBackButton={showBackButton} title={headerTitle} rightIcons={headerRightIcons} />

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
            className="flex-1 py-6 overflow-y-auto"
            style={{ paddingBottom: showBottomTabs ? `${BOTTOM_CONTENT_PADDING}px` : undefined }}
          >
            <div className="app-container">{children ? children : <Outlet />}</div>
          </main>

          {/* Desktop Footer */}
          {showFooter && (
            <footer className="hidden lg:block border-t">
              <div className="app-container py-4">
                <p className="text-sm text-muted-foreground text-center">
                  &copy; {new Date().getFullYear()} Saraighat Digital. All rights reserved.
                </p>
              </div>
            </footer>
          )}
        </div>

        {/* Right Sidebar */}
        {showRightSidebar && <Navigation config={navigationConfig} variant="right" />}
      </div>

      {/* Bottom Tabs (Mobile & Tablet) */}
      {showBottomTabs && (
        <div className="lg:hidden border-t bg-background">
          <div className="app-container">
            <Navigation config={navigationConfig} variant="bottom" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

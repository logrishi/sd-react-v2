import { type FC, Outlet, type ReactNode } from "@/lib/vendors";
import Navigation from "../navigation";
import { navigationConfig } from "@/lib/config/navigation.config";
import { cn } from "@/lib/utils/utils";

interface LayoutProps {
  children?: ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showBottomTabs?: boolean;
  showFooter?: boolean;
}

export const Layout: FC<LayoutProps> = ({
  children,
  showLeftSidebar = true,
  showRightSidebar = false,
  showBottomTabs = true,
  showFooter = true,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-background layout-sidebar">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="app-container flex h-14 items-center">
          <h1 className="text-xl font-bold">Saraighat Digital</h1>
        </div>
      </header>

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
          <main className="flex-1 py-6 overflow-y-auto">
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

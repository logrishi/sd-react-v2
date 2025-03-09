import { type FC, useState, useEffect } from "@/lib/vendors";
import { useLocation } from "react-router-dom";
import { routes } from "@/routes";
import { useAccessControl } from "@/lib/hooks/useAccessControl";

interface BannerProviderProps {
  children: React.ReactNode;
}

export const BannerProvider: FC<BannerProviderProps> = ({ children }) => {
  const location = useLocation();
  const [BannerComponent, setBannerComponent] = useState<React.ComponentType<any> | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const { checkAccess } = useAccessControl();
  const [message, setMessage] = useState<string>("");

  // Update message when route changes
  useEffect(() => {
    const { message: accessMessage } = checkAccess();
    setMessage(accessMessage || "");
  }, [location.pathname, checkAccess]);

  // Load banner component
  useEffect(() => {
    const currentRoute: any = routes.find((route) => {
      // Convert route path to regex to match dynamic routes
      const routeRegex = new RegExp("^" + route.path.replace(/:[^/]+/g, "[^/]+") + "$");
      return routeRegex.test(location.pathname);
    });

    if (currentRoute?.layoutProps?.banner?.component) {
      const loadComponent = async () => {
        try {
          const module = await currentRoute.layoutProps.banner.component();
          const Component = module.default || module;
          setBannerComponent(() => Component);
          setShowBanner(true);
        } catch (error) {
          console.error("Error loading banner component:", error);
          setShowBanner(false);
        }
      };
      loadComponent();
    } else {
      setBannerComponent(null);
      setShowBanner(false);
    }
  }, [location.pathname]);

  if (!BannerComponent || !showBanner) return <>{children}</>;

  const currentRoute = routes.find((route) => {
    const routeRegex = new RegExp("^" + route.path.replace(/:[^/]+/g, "[^/]+") + "$");
    return routeRegex.test(location.pathname);
  });

  const bannerConfig = currentRoute?.layoutProps?.banner?.config || {};
  const hasBottomTabs = currentRoute?.layoutProps?.showBottomTabs;

  return (
    <>
      {children}
      <BannerComponent
        isOpen={showBanner}
        onClose={() => setShowBanner(false)}
        message={message}
        {...bannerConfig}
        hasBottomTabs={hasBottomTabs}
      />
    </>
  );
};

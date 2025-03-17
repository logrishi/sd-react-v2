import { type FC, type ReactNode } from "@/lib/vendors";
import { SESSION_REFRESH_INTERVAL, USE_TEST_MODE } from "@/lib/utils/session";
import { useEffect } from "@/lib/vendors";
import { useSessionCheck } from "@/lib/hooks/useSessionCheck";

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  // Initialize session check with the interval from session.ts
  useSessionCheck({
    checkInterval: SESSION_REFRESH_INTERVAL, // Uses the exported constant
  });

  // Log on mount to verify the component is loading properly
  useEffect(() => {
    console.log(`🏠 RootLayout mounted - session check enabled (${USE_TEST_MODE ? "TEST MODE" : "PRODUCTION MODE"})`);
    return () => {
      console.log("🏠 RootLayout unmounted - session check disabled");
    };
  }, []);

  return <>{children}</>;
};

export default RootLayout;

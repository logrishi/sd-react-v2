import { useEffect, type FC } from "@/lib/vendors";
import { useNavigate } from "react-router-dom";
import { checkAndUpdateSessionStatus } from "@/lib/utils/session";
import { store } from "@/services/store";

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export const SessionManager: FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = store.auth.get();

  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial check
    const checkSession = async () => {
      const isValid = await checkAndUpdateSessionStatus();
      if (!isValid) {
        navigate("/login");
      }
    };

    checkSession();

    // Set up periodic checks
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, navigate]);

  return <>{children}</>;
};

export default SessionManager;

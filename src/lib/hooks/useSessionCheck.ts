import {
  MAX_RETRIES,
  NETWORK_RETRY_DELAY,
  SECURITY_CHECK_INTERVAL,
  SESSION_EXPIRY_TIME,
  SESSION_REFRESH_INTERVAL,
  checkSecurityFlags,
  formatSessionTimeRemaining,
} from "@/lib/utils/session";
import {
  USER_FIELDS,
  checkUserExists,
  getUserFullDetails,
  handleLoginSuccess,
  handleLogout,
  login,
  updateUser,
} from "@/services/backend/actions";
import { useCallback, useEffect, useRef } from "@/lib/vendors";

import { store } from "@/services/store";
import { useNavigate } from "@/lib/vendors";

// Define extended user type with login_device_id
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image: string;
  password: string;
  login_device_id?: string;
}

// Session check hook for handling session refresh and security checks
export function useSessionCheck(options?: { checkInterval?: number }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, lastLogin, loginDeviceId, deviceToken } = store.auth.get();

  // Use provided check interval or default
  const checkInterval = options?.checkInterval || SESSION_REFRESH_INTERVAL;

  // Maintain session check state
  const sessionState = useRef({
    isRetrying: false,
    lastSuccessfulCheck: null,
    retryCount: 0,
  });

  // Function to check session status and refresh if needed
  const checkStatus = useCallback(
    async (shouldUpdateDevice = false) => {
      try {
        if (!isLoggedIn || !user) {
          console.log("🛑 Session check: No user logged in");
          return;
        }

        console.log("🔄 Session refresh check");

        // Check if user still exists and get latest data
        const userResponse = await checkUserExists(user.email, {
          fields: "id, email, password, login_device_id, force_logout, force_password_reset, device_token",
        });

        if (!userResponse?.result?.length) {
          console.error("⛔ User not found or soft deleted");
          handleLogout();
          navigate("/login", { replace: true });
          return;
        }

        const userData = userResponse.result[0];

        // Handle force logout
        if (userData.force_logout) {
          console.log("🚪 Force logout detected");
          await updateUser(userData.id, { force_logout: 0 });
          handleLogout();
          navigate("/login", { replace: true });
          return;
        }

        // Handle force password reset
        if (userData.force_password_reset) {
          console.log("🔑 Force password reset detected");
          store.auth.set({
            ...store.auth.get(),
            forcePasswordReset: true,
          });
          await updateUser(userData.id, { force_password_reset: 0 });
          navigate("/password-reset", { replace: true });
          return;
        }

        // Check if current device ID matches the one in the database
        const storedDeviceId = userData.login_device_id;
        const currentDeviceId = loginDeviceId || ""; // Ensure it's at least an empty string

        // If device IDs don't match, this device has been logged out by another login
        if (storedDeviceId && currentDeviceId && storedDeviceId !== currentDeviceId) {
          console.log("🔒 This device has been logged out by a login from another device");
          handleLogout();
          navigate("/login", { replace: true });
          return;
        }

        // Re-login to refresh token and ensure device ID is current
        const loginResponse = await login(
          { email: user.email, password: user.password },
          { fields: "id" }, // Only need ID for authentication
          currentDeviceId,
          deviceToken
        );

        if (loginResponse.err) {
          console.error("❌ Session refresh failed:", loginResponse.err);
          handleLogout();
          navigate("/login", { replace: true });
          return;
        }

        // Update auth store with refreshed data - properly await it
        const userDetailsResult = await handleLoginSuccess(loginResponse);
        if (!userDetailsResult.success) {
          console.error("❌ Session refresh failed: Could not get user details");
          handleLogout();
          navigate("/login", { replace: true });
          return;
        }
        console.log("✅ Session refreshed successfully");
      } catch (error: any) {
        console.error("❌ Error checking session status:", error);

        // Handle network errors with retry logic
        // if (!navigator.onLine || (error.message && error.message.includes("network"))) {
        //   console.log("🔄 Network issue, will retry soon...");
        //   sessionState.current.isRetrying = true;
        //   if (sessionState.current.retryCount < MAX_RETRIES) {
        //     sessionState.current.retryCount++;
        //     setTimeout(() => checkStatus(false), NETWORK_RETRY_DELAY * sessionState.current.retryCount);
        //     return;
        //   }
        // }

        if (isLoggedIn) {
          handleLogout();
          navigate("/login", { replace: true });
        }
      }
    },
    [navigate, isLoggedIn, user, loginDeviceId, deviceToken]
  );

  // Set up security check interval
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Initial security check
    checkSecurityFlags(navigate);

    // Set up security check interval
    const securityInterval = setInterval(() => {
      console.log("🔒 Running security flag check");
      checkSecurityFlags(navigate);
    }, SECURITY_CHECK_INTERVAL);

    return () => clearInterval(securityInterval);
  }, [navigate, isLoggedIn, user]);

  // Set up session refresh interval
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Log session refresh configuration
    console.group("🔄 Session Auto-Refresh Configuration");
    console.log(`Mode: ${SESSION_REFRESH_INTERVAL === 15 * 1000 ? "TEST MODE ⚡" : "PRODUCTION MODE 🔒"}`);
    console.log(`Session expires after: ${SESSION_EXPIRY_TIME / 1000} seconds`);
    console.log(`Will refresh every: ${checkInterval / 1000} seconds`);
    console.log(`Security checks every: ${SECURITY_CHECK_INTERVAL / 1000} seconds`);
    console.groupEnd();

    // Initial check
    checkStatus(true);

    // Set up periodic check
    const interval = setInterval(() => {
      checkStatus(true);
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkStatus, checkInterval, isLoggedIn, user]);

  return { checkStatus };
}

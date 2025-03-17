import {
  USER_FIELDS,
  checkUserExists,
  handleLoginSuccess,
  handleLogout,
  login,
  updateUser,
} from "@/services/backend/actions";

import { store } from "@/services/store";

// Toggle between test mode and production mode
export const USE_TEST_MODE = true; // Set to false for production

// Test timing constants (very short for immediate testing)
// const TEST_SESSION_EXPIRY_TIME = 30 * 1000; // 30 seconds
// const TEST_SESSION_REFRESH_INTERVAL = 15 * 1000; // 15 seconds
// const TEST_SECURITY_CHECK_INTERVAL = 10 * 1000; // 10 seconds (for security flags)

const TEST_SESSION_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const TEST_SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TEST_SECURITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes (for security flags)

const TEST_NETWORK_RETRY_DELAY = 3000; // 3 seconds
const TEST_MAX_RETRIES = 3;

// Production timing constants
const PROD_SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
const PROD_SESSION_REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours
// const PROD_SECURITY_CHECK_INTERVAL = 60 * 1000; // 1 minute (for security flags)

const PROD_SECURITY_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour (for security flags)

const PROD_NETWORK_RETRY_DELAY = 5000; // 5 seconds
const PROD_MAX_RETRIES = 3;

// Export the appropriate constants based on mode
export const SESSION_EXPIRY_TIME = USE_TEST_MODE ? TEST_SESSION_EXPIRY_TIME : PROD_SESSION_EXPIRY_TIME;
export const SESSION_REFRESH_INTERVAL = USE_TEST_MODE ? TEST_SESSION_REFRESH_INTERVAL : PROD_SESSION_REFRESH_INTERVAL;
export const SECURITY_CHECK_INTERVAL = USE_TEST_MODE ? TEST_SECURITY_CHECK_INTERVAL : PROD_SECURITY_CHECK_INTERVAL;
export const NETWORK_RETRY_DELAY = USE_TEST_MODE ? TEST_NETWORK_RETRY_DELAY : PROD_NETWORK_RETRY_DELAY;
export const MAX_RETRIES = USE_TEST_MODE ? TEST_MAX_RETRIES : PROD_MAX_RETRIES;

// Log which mode is being used
console.log(`🔧 Session configuration: ${USE_TEST_MODE ? "TEST MODE" : "PRODUCTION MODE"}`);
console.log(`⏱️ Session expiry: ${SESSION_EXPIRY_TIME / 1000}s, Refresh interval: ${SESSION_REFRESH_INTERVAL / 1000}s`);
console.log(`🔒 Security check interval: ${SECURITY_CHECK_INTERVAL / 1000}s`);

export const isSessionExpired = (lastLoginTime: string | null): boolean => {
  if (!lastLoginTime) return true;

  const lastLogin = new Date(lastLoginTime).getTime();
  const currentTime = new Date().getTime();
  return currentTime - lastLogin > SESSION_EXPIRY_TIME;
};

export const checkSubscriptionStatus = (
  expiryDate: string | null
): { isSubscribed: boolean; isSubscriptionExpired: boolean } => {
  if (!expiryDate) {
    return { isSubscribed: false, isSubscriptionExpired: false };
  }

  const currentDate = new Date();
  const expiry = new Date(expiryDate);

  return {
    isSubscribed: true,
    isSubscriptionExpired: currentDate > expiry,
  };
};

export const autoLogin = async (credentials: { email: string; password: string }): Promise<boolean> => {
  try {
    // Get current user to retrieve device ID and token if they exist
    const { loginDeviceId, deviceToken } = store.auth.get();

    // Pass the device ID and token to ensure we maintain the same device session
    const loginResponse = await login(
      credentials,
      {
        fields: "id",
      },
      loginDeviceId,
      deviceToken
    );

    if (!loginResponse.err) {
      // Only update auth store if login was successful
      const userDetailsResult = await handleLoginSuccess(loginResponse);
      if (userDetailsResult.success) {
        console.log("🔄 Auto-login successful - session refreshed!");
        return true;
      }
      console.error("❌ Failed to get user details after login");
      return false;
    }
    return false;
  } catch (error) {
    console.error("❌ Auto-login failed:", error);
    return false;
  }
};

export const checkAndUpdateSessionStatus = async (): Promise<boolean> => {
  const { lastLogin, user } = store.auth.get();
  console.log("🔍 Checking session status...", { lastLogin });

  if (!user?.email || !lastLogin) {
    console.log("❌ No user or lastLogin found in store");
    return false;
  }

  // Check if session has expired
  if (isSessionExpired(lastLogin)) {
    console.log("⚠️ Session expired, attempting auto-login...");

    // Attempt to auto-login if session expired
    const success = await autoLogin({
      email: user.email,
      password: user.password,
    });

    if (!success) {
      // Handle logout on failed auto-login
      console.log("❌ Auto-login failed, logging out");
      handleLogout();
      return false;
    }

    console.log("✅ Auto-login successful");
  } else {
    console.log("✅ Session is still valid");
  }

  // Update subscription status
  const { expiryDate } = store.auth.get();
  const { isSubscribed, isSubscriptionExpired } = checkSubscriptionStatus(expiryDate);

  store.auth.set({
    ...store.auth.get(),
    isSubscribed,
    isSubscriptionExpired,
  });

  return true;
};

// Helper function to format time remaining until session expires
export const formatSessionTimeRemaining = (lastLoginTime: string | null): string => {
  if (!lastLoginTime) return "Session expired";

  const lastLogin = new Date(lastLoginTime).getTime();
  const currentTime = new Date().getTime();
  const timeElapsed = currentTime - lastLogin;

  if (timeElapsed > SESSION_EXPIRY_TIME) {
    return "Session expired";
  }

  const timeRemaining = SESSION_EXPIRY_TIME - timeElapsed;
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// New function to check security flags (force logout, force password reset)
export const checkSecurityFlags = async (navigate: any): Promise<boolean> => {
  try {
    const { user, loginDeviceId, deviceToken } = store.auth.get();

    if (!user?.id || !user?.email) {
      return false;
    }

    // Only fetch security-related fields to keep request lightweight
    const response = await checkUserExists(user.email, {
      fields: "id, force_logout, force_password_reset, login_device_id, previous_device_id, device_token",
    });

    if (!response?.result?.length) {
      return false;
    }

    const userData = response.result[0];

    // Check if this device has been logged out by another device
    const currentDeviceId = loginDeviceId;
    const activeDeviceId = userData.login_device_id;
    const previousDeviceId = userData.previous_device_id;

    // If current device matches previous device ID, this device has been logged out
    if (currentDeviceId && previousDeviceId && currentDeviceId === previousDeviceId) {
      console.log("🔒 Security check: This device has been logged out by another device");
      handleLogout();
      if (navigate) navigate("/login", { replace: true });
      return true;
    }

    // If device IDs don't match, and this isn't the active device, logout
    if (currentDeviceId && activeDeviceId && currentDeviceId !== activeDeviceId) {
      console.log("🔒 Security check: This device is no longer the active device");
      handleLogout();
      if (navigate) navigate("/login", { replace: true });
      return true;
    }

    // Handle force password reset
    if (userData.force_password_reset) {
      console.log("🔒 Security check: Force password reset detected");
      store.auth.set({
        ...store.auth.get(),
        forcePasswordReset: true,
      });
      await updateUser(userData.id, { force_password_reset: 0 });
      if (navigate) navigate("/password-reset", { replace: true });
      return true;
    }

    // Handle force logout
    if (userData.force_logout) {
      console.log("🔒 Security check: Force logout detected");
      await updateUser(userData.id, { force_logout: 0 });
      handleLogout();
      if (navigate) navigate("/login", { replace: true });
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error checking security flags:", error);
    return false;
  }
};

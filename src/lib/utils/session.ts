import { store } from "@/services/store";
import { login, handleLogout } from "@/services/backend/actions";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const isSessionExpired = (lastLoginTime: string | null): boolean => {
  if (!lastLoginTime) return true;

  const lastLogin = new Date(lastLoginTime).getTime();
  const currentTime = new Date().getTime();
  return currentTime - lastLogin > TWENTY_FOUR_HOURS;
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
    const loginResponse = await login(credentials);
    return !loginResponse.err;
  } catch (error) {
    return false;
  }
};

export const checkAndUpdateSessionStatus = async (): Promise<boolean> => {
  const { lastLogin, user } = store.auth.get();

  if (!user?.email || !lastLogin) {
    return false;
  }

  // Check if session has expired
  if (isSessionExpired(lastLogin)) {
    // Attempt to auto-login if session expired
    const success = await autoLogin({
      email: user.email,
      password: user.password, // Note: You'll need to handle password storage securely
    });

    if (!success) {
      // Handle logout on failed auto-login
      handleLogout();
      return false;
    }
  }

  // Update subscription status
  const { expiryDate } = store.auth.get();
  const { isSubscribed, isSubscriptionExpired } = checkSubscriptionStatus(expiryDate);

  store.auth.set({
    isSubscribed,
    isSubscriptionExpired,
  });

  return true;
};

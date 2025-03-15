import { store } from "@/services/store";

export type AccessStatus = {
  canAccess: boolean;
  message: string;
  requiresLogin: boolean;
  requiresSubscription: boolean;
};

export const useAccessControl = () => {
  const { isLoggedIn, isDeleted, isSubscribed, isSubscriptionExpired } = store.auth.get();

  const checkAccess = (isFree: boolean = false): AccessStatus => {
    if (!isLoggedIn) {
      return {
        canAccess: false,
        message: isFree
          ? "Login to access this free content"
          : "Login to access our collection of e-books and audio books",
        requiresLogin: true,
        requiresSubscription: false,
      };
    }

    if (isDeleted) {
      return {
        canAccess: false,
        message: "Your account has been deleted. Please contact support.",
        requiresLogin: false,
        requiresSubscription: false,
      };
    }

    // If content is free and user is logged in, grant access
    if (isFree && isLoggedIn) {
      return {
        canAccess: true,
        message: "",
        requiresLogin: false,
        requiresSubscription: false,
      };
    }

    // For free content, only login is required
    if (isFree) {
      return {
        canAccess: false,
        message: "Login to access this free content",
        requiresLogin: true,
        requiresSubscription: false,
      };
    }

    // For paid content, check subscription status
    if (!isSubscribed) {
      return {
        canAccess: false,
        message: "Subscribe today to gain access to e-books and audio books",
        requiresLogin: false, // User is already logged in at this point
        requiresSubscription: true,
      };
    }

    if (isSubscriptionExpired) {
      return {
        canAccess: false,
        message: "Your subscription has expired! Renew today to continue access to e-books and audio books",
        requiresLogin: false, // User is already logged in at this point
        requiresSubscription: true,
      };
    }

    return {
      canAccess: true,
      message: "",
      requiresLogin: false,
      requiresSubscription: false,
    };
  };

  return { checkAccess };
};

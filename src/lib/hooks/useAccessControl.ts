import { store } from "@/services/store";

export type AccessStatus = {
  canAccess: boolean;
  message: string;
  // showSubscribeSheet flag removed
};

export const useAccessControl = () => {
  const { isLoggedIn, isDeleted, isSubscribed, isSubscriptionExpired } = store.auth.get();

  const checkAccess = (): AccessStatus => {
    if (!isLoggedIn) {
      return {
        canAccess: false,
        message: "Subscribe today to gain access to e-books and audio books",
      };
    }

    if (isDeleted) {
      return {
        canAccess: false,
        message: "Your account has been deleted. Please contact support.",
      };
    }

    if (!isSubscribed) {
      return {
        canAccess: false,
        message: "Subscribe today to gain access to e-books and audio books",
      };
    }

    if (isSubscriptionExpired) {
      return {
        canAccess: false,
        message: "Your subscription has expired! Renew today to continue access to e-books and audio books",
      };
    }

    return {
      canAccess: true,
      message: "",
    };
  };

  return { checkAccess };
};

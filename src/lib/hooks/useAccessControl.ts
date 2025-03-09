import { store } from "@/services/store";

export type AccessStatus = {
  canAccess: boolean;
  message: string;
  showSubscribeSheet: boolean;
};

export const useAccessControl = () => {
  const { isLoggedIn, isDeleted, isSubscribed, isSubscriptionExpired } = store.auth.get();

  const checkAccess = (): AccessStatus => {
    if (!isLoggedIn) {
      return {
        canAccess: false,
        message: "Subscribe today to gain access to e-books and audio books",
        showSubscribeSheet: true,
      };
    }

    if (isDeleted) {
      return {
        canAccess: false,
        message: "Your account has been deleted. Please contact support.",
        showSubscribeSheet: false,
      };
    }

    if (!isSubscribed) {
      return {
        canAccess: false,
        message: "Subscribe today to gain access to e-books and audio books",
        showSubscribeSheet: true,
      };
    }

    if (isSubscriptionExpired) {
      return {
        canAccess: false,
        message: "Your subscription has expired! Renew today to continue access to e-books and audio books",
        showSubscribeSheet: true,
      };
    }

    return {
      canAccess: true,
      message: "",
      showSubscribeSheet: false,
    };
  };

  return { checkAccess };
};

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkForceFlags, updateForceFlags, handleLogout } from "@/services/backend/actions";
import { store } from "@/services/store";

export const withForceFlags = (WrappedComponent: React.ComponentType) => {
  return function WithForceFlagsComponent(props: any) {
    const navigate = useNavigate();
    const { user, isLoggedIn, force_password_reset, force_logout }: any = store.auth.get() ?? {};

    useEffect(() => {
      const checkFlags = async () => {
        if (isLoggedIn && user?.id) {
          const response = await checkForceFlags(user.id);

          if (response?.force_logout) {
            // Update flag in database first
            await updateForceFlags(user.id, { force_logout: 0 });

            // Handle logout
            handleLogout();

            // Redirect to login
            navigate("/login", { replace: true });
            return;
          }

          if (response?.force_password_reset) {
            // Update store
            store.auth.set({ forcePasswordReset: true });

            // Update flag in database
            await updateForceFlags(user.id, { force_password_reset: 0 });

            // Redirect to password-reset
            navigate("/password-reset", { replace: true });
            return;
          }
        }
      };

      checkFlags();
    }, [isLoggedIn, user?.id, navigate]);

    // If force password reset is true, redirect to password-reset
    useEffect(() => {
      if (force_password_reset) {
        navigate("/password-reset");
      }
    }, [force_password_reset, navigate]);

    // If force logout is true, handle logout
    useEffect(() => {
      if (force_logout) {
        handleLogout();
        navigate("/login");
      }
    }, [force_logout, navigate]);

    return <WrappedComponent {...props} />;
  };
};

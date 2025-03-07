import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkForceFlags, updateForceFlags, handleLogout } from "@/services/backend/actions";
import { store } from "@/services/store";

export const withForceFlags = (WrappedComponent: React.ComponentType) => {
  return function WithForceFlagsComponent(props: any) {
    const navigate = useNavigate();
    const { user, isLoggedIn, forcePasswordReset, forceLogout }: any = store.auth.get() ?? {};

    useEffect(() => {
      const checkFlags = async () => {
        if (isLoggedIn && user?.id) {
          const response = await checkForceFlags(user.id);

          if (response?.forceLogout) {
            // Update flag in database first
            await updateForceFlags(user.id, { forceLogout: false });
            
            // Handle logout
            handleLogout();
            
            // Redirect to login
            navigate("/login");
            return;
          }

          if (response?.forcePasswordReset) {
            // Update store
            store.auth.set({ forcePasswordReset: true });

            // Update flag in database
            await updateForceFlags(user.id, { forcePasswordReset: false });

            // Redirect to password-reset
            navigate("/password-reset");
            return;
          }
        }
      };

      checkFlags();
    }, [isLoggedIn, user?.id, navigate]);

    // If force password reset is true, redirect to password-reset
    useEffect(() => {
      if (forcePasswordReset) {
        navigate("/password-reset");
      }
    }, [forcePasswordReset, navigate]);

    // If force logout is true, handle logout
    useEffect(() => {
      if (forceLogout) {
        handleLogout();
        navigate("/login");
      }
    }, [forceLogout, navigate]);

    return <WrappedComponent {...props} />;
  };
};

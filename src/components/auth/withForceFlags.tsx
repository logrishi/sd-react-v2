import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkForceFlags, updateForceFlags } from "@/services/backend/actions";
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
            // Clear auth state
            store.auth.set({
              user: {},
              token: null,
              session: null,
              isLoggedIn: false,
              isAdmin: false,
              forcePasswordReset: false,
              forceLogout: false,
            });

            // Update flag in database
            await updateForceFlags(user.id, { forceLogout: false });

            // Clear localStorage
            localStorage.clear();

            // Redirect to login
            navigate("/login");
            return;
          }

          if (response?.forcePasswordReset) {
            // Update store
            store.auth.set({ forcePasswordReset: true });

            // Update flag in database
            await updateForceFlags(user.id, { forcePasswordReset: false });

            // Redirect to forgot-password
            navigate("/forgot-password");
            return;
          }
        }
      };

      checkFlags();
    }, [isLoggedIn, user?.id, navigate]);

    // If force password reset is true, redirect to forgot-password
    useEffect(() => {
      if (forcePasswordReset) {
        navigate("/forgot-password");
      }
    }, [forcePasswordReset, navigate]);

    // If force logout is true, handle logout
    useEffect(() => {
      if (forceLogout) {
        localStorage.clear();
        store.auth.set({
          user: {},
          token: null,
          session: null,
          isLoggedIn: false,
          isAdmin: false,
          forcePasswordReset: false,
          forceLogout: false,
        });
        navigate("/login");
      }
    }, [forceLogout, navigate]);

    return <WrappedComponent {...props} />;
  };
};

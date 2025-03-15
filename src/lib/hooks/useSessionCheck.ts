// import { useEffect, useCallback, useRef } from "@/lib/vendors";
// import { useNavigate } from "@/lib/vendors";
// import { store } from "@/services/store";
// import { USER_DETAILS_FIELDS } from "@/services/backend/actions";
// import {
//   handleLogout,
//   getUserDetails,
//   checkUserExists,
//   login,
//   handleLoginSuccess,
//   updateUser,
// } from "@/services/backend/actions";

// // Types
// interface StoreUser {
//   id: string;
//   email: string;
//   name: string;
//   image: string;
//   password: string;
// }

// // Extended user interface for API responses
// interface User extends StoreUser {
//   expiry_date?: string;
//   is_admin?: boolean;
//   is_deleted?: boolean;
//   force_logout?: boolean;
//   force_password_reset?: boolean;
//   last_login?: string;
//   login_device_id?: string;
//   device_token?: string;
// }

// interface AuthState {
//   isLoggedIn: boolean;
//   user: StoreUser | undefined;
//   session: null;
//   isSubscribed: boolean;
//   isSubscriptionExpired: boolean;
//   expiryDate: null;
//   isAdmin: boolean;
//   isDeleted: boolean;
//   updatePassword: boolean;
//   forcePasswordReset: boolean;
//   forceLogout: boolean;
//   lastLogin: null;
// }

// interface SessionCheckState {
//   isRetrying: boolean;
//   lastSuccessfulCheck: Date | null;
//   retryCount: number;
//   loginDeviceId: string;
//   deviceToken: string;
// }

// // Constants for intervals and timeouts
// const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
// const SESSION_EXPIRY_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
// const NETWORK_RETRY_DELAY = 5000; // 5 seconds
// const MAX_RETRIES = 3;

// // Generate a unique device ID
// const generateDeviceId = (): string => {
//   const timestamp = Date.now();
//   const random = Math.random().toString(36).substring(2);
//   return `${timestamp}-${random}`;
// };

// // Check subscription status based on expiry date and soft delete status
// const checkSubscriptionStatus = (
//   expiryDate: string | null | undefined,
//   isDeleted: boolean = false
// ): { isSubscribed: boolean; isSubscriptionExpired: boolean } => {
//   // Per memory requirement - if user is soft deleted, they have no subscription
//   if (isDeleted) {
//     return { isSubscribed: false, isSubscriptionExpired: true };
//   }

//   if (!expiryDate) {
//     return { isSubscribed: false, isSubscriptionExpired: false };
//   }

//   const currentDate = new Date();
//   const expiry = new Date(expiryDate);
//   const isExpired = currentDate > expiry;

//   return {
//     isSubscribed: !isExpired,
//     isSubscriptionExpired: isExpired,
//   };
// };

// const useSessionCheck = (): void => {
//   const navigate = useNavigate();
//   const { isLoggedIn, user } = store.auth.get() as unknown as AuthState;

//   // Maintain session check state
//   const sessionState = useRef<SessionCheckState>({
//     isRetrying: false,
//     lastSuccessfulCheck: null,
//     retryCount: 0,
//     loginDeviceId: generateDeviceId(),
//     deviceToken: "",
//   });

//   // Check session and force flags - ensure single instance of session check through RootLayout
//   const checkStatus = useCallback(
//     async (isFullCheck = false): Promise<void> => {
//       try {
//         // Safety check for user and online status
//         if (!isLoggedIn || !user) {
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         if (navigator.onLine) {
//           sessionState.current.retryCount = 0;
//         }

//         // Ensure we have complete user credentials
//         if (!user?.email || !user?.id) {
//           console.error("Missing user credentials");
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Step 1: Check if user exists and is not deleted (filtered by is_deleted:0)
//         const existingUser = await checkUserExists(user.email, {
//           fields: USER_DETAILS_FIELDS
//         });

//         if (!existingUser?.result?.length) {
//           console.error("User not found or soft deleted");
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Update store with user details from API
//         const existingUserData = existingUser.result[0];
//         store.auth.set({
//           ...store.auth.get(),
//           user: {
//             id: existingUserData.id,
//             name: existingUserData.name || "",
//             email: existingUserData.email,
//             image: existingUserData.image || "",
//             password: ""
//           },
//           isAdmin: Boolean(existingUserData.is_admin),
//           isDeleted: Boolean(existingUserData.is_deleted),
//           forcePasswordReset: Boolean(existingUserData.force_password_reset),
//           forceLogout: Boolean(existingUserData.force_logout)
//         });

//         // Step 2: Refresh login session to prevent expiry
//         const loginResponse = await login(
//           { email: user.email, password: user.password },
//           { fields: USER_DETAILS_FIELDS }
//         );

//         if (loginResponse.err) {
//           console.error("Login refresh failed");
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Step 3: Update session state with login response and get full user details
//         const { success } = await handleLoginSuccess(loginResponse, sessionState.current.loginDeviceId);
//         if (!success) {
//           console.error("Failed to update session state");
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Get user data from store after handleLoginSuccess updates it
//         const { user: userData } = store.auth.get() as AuthState;
//         if (!userData) {
//           console.error("User data not found in store");
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Cast userData to User type for proper type checking
//         const userDetails = userData as User;

//         // Handle concurrent sessions - ensure single instance of session check
//         if (userDetails.login_device_id && userDetails.login_device_id !== sessionState.current.loginDeviceId) {
//           console.warn("Session active on another device");
//           handleLogout();
//           navigate("/login", { replace: true, state: { reason: "concurrent_session" } });
//           return;
//         }

//         // Check session expiry if it's a full check
//         if (isFullCheck && userDetails.last_login) {
//           const lastLogin = new Date(userDetails.last_login).getTime();
//           const currentTime = new Date().getTime();
//           if (currentTime - lastLogin > SESSION_EXPIRY_INTERVAL) {
//             console.warn("Session expired");
//             handleLogout();
//             navigate("/login", { replace: true, state: { reason: "session_expired" } });
//             return;
//           }
//         }

//         // Handle force password reset
//         if (userDetails.force_password_reset) {
//           store.auth.set({ forcePasswordReset: true });
//           await updateUser(userDetails.id, { force_password_reset: 0 });
//           navigate("/password-reset", { replace: true });
//           return;
//         }

//         // Handle force logout
//         if (userDetails.force_logout) {
//           await updateUser(userDetails.id, { force_logout: 0 });
//           handleLogout();
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Update device ID and last login silently
//         await updateUser(userData.id, {
//           login_device_id: sessionState.current.loginDeviceId,
//           last_login: new Date().toISOString(),
//         });

//         // Check subscription status
//         const { isSubscribed, isSubscriptionExpired } = checkSubscriptionStatus(
//           (userData as User).expiry_date || null,
//           Boolean((userData as User).is_deleted || false)
//         );

//         // Update store with critical flags
//         const currentState = store.auth.get() as unknown as AuthState;
//         // Ensure we maintain session integrity and proper user state management
//         store.auth.set({
//           isLoggedIn: currentState.isLoggedIn,
//           user: userData
//             ? {
//                 id: userData.id,
//                 name: userData.name || "",
//                 email: userData.email,
//                 image: userData.image || "",
//                 password: "",
//               }
//             : undefined,
//           session: null,
//           isSubscribed,
//           isSubscriptionExpired,
//           expiryDate: null,
//           isAdmin: Boolean((userData as User).is_admin),
//           isDeleted: Boolean((userData as User).is_deleted),
//           updatePassword: false,
//           forcePasswordReset: Boolean((userData as User).force_password_reset),
//           forceLogout: Boolean((userData as User).force_logout),
//           lastLogin: null,
//         });

//         // Update session state
//         sessionState.current.lastSuccessfulCheck = new Date();
//         sessionState.current.isRetrying = false;
//         sessionState.current.retryCount = 0;
//       } catch (error: unknown) {
//         const err = error as Error;
//         console.error("Error checking session status:", err);

//         // Handle network errors with retry logic
//         if (!navigator.onLine || (err.message && err.message.includes("network"))) {
//           sessionState.current.isRetrying = true;
//           if (sessionState.current.retryCount < MAX_RETRIES) {
//             sessionState.current.retryCount++;
//             setTimeout(() => void checkStatus(false), NETWORK_RETRY_DELAY * sessionState.current.retryCount);
//             return;
//           }
//         }

//         handleLogout();
//         navigate("/login", { replace: true });
//       }
//     },
//     [navigate, user]
//   );

//   // Handle network status changes
//   const handleNetworkChange = useCallback(() => {
//     if (navigator.onLine && isLoggedIn && user && sessionState.current.isRetrying) {
//       void checkStatus(false); // Retry check when network is restored
//     }
//   }, [checkStatus]);

//   // Handle tab visibility changes
//   const handleVisibilityChange = useCallback(() => {
//     if (document.visibilityState === "visible") {
//       void checkStatus(false);
//     }
//   }, [checkStatus]);

//   // Set up network status and visibility listeners
//   useEffect(() => {
//     // Only set up listeners if user is logged in
//     if (!isLoggedIn || !user) return;

//     window.addEventListener("online", handleNetworkChange);
//     window.addEventListener("offline", handleNetworkChange);
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () => {
//       window.removeEventListener("online", handleNetworkChange);
//       window.removeEventListener("offline", handleNetworkChange);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, [handleNetworkChange, handleVisibilityChange, isLoggedIn, user]);

//   // Initial check and periodic checks
//   useEffect(() => {
//     // Only run checks if user is logged in
//     if (!isLoggedIn || !user) return;

//     void checkStatus(true);

//     const lightCheckInterval = setInterval(() => void checkStatus(false), CHECK_INTERVAL);
//     const fullCheckInterval = setInterval(() => void checkStatus(true), SESSION_EXPIRY_INTERVAL);

//     return () => {
//       clearInterval(lightCheckInterval);
//       clearInterval(fullCheckInterval);
//     };
//   }, [checkStatus, isLoggedIn, user]);
// };

// export default useSessionCheck;

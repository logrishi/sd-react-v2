import { hashPassword, sendToNative } from "@/lib/utils/utils";

import Api from "./api";
import { axios } from "@/lib/vendors";
import { clearCache } from "./cache";
// import { checkSubscriptionStatus } from "@/lib/utils/session";
import { compressImage } from "@/lib/utils/image-compression";
import { formatBookData } from "@/lib/utils/text-utils";
import { store } from "@/services/store";

// Debug utility
const debug = {
  log: (message: string, data: any) => {
    console.log(`[DEBUG] ${message}:`, data);
    // if (store.isNative.get().isNative) {
    //   sendToNative({ type: "debug", message, data });
    // }
    return data;
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR ❌ ] ${message}:`, error);
    sendToNative({ type: "error", message, error });

    // Log errors to a centralized service in production
    if (window.location.hostname == "saraighatdigital.com") {
      logErrorToService(message, error);
    }

    throw error;
  },
};

function logErrorToService(message: string, error: any) {
  try {
    // Extract useful information from the error object in a readable format
    const errorInfo = {
      // Context of where the error occurred
      context: message,
      // Extract endpoint URL from different possible locations
      endpoint:
        error?.config?.url ||
        error?.request?.url ||
        error?.response?.config?.url ||
        (error?.request instanceof XMLHttpRequest ? error.request.responseURL : null) ||
        "unknown-endpoint",
      // HTTP status code if available
      statusCode: error?.response?.status || "unknown-status",
      // Error message
      errorMessage: error?.message || error?.toString() || "Unknown error",
      // Response data if available
      responseData: error?.response?.data || null,
      // User information
      userId: store.auth.get()?.user?.id || "unauthenticated",
      // Environment information
      isNative: store.isNative.get().isNative,
      isOnline: navigator?.onLine,
      timestamp: new Date().toISOString(),
    };

    // Send to Sentry with the structured information
    import("@sentry/browser")
      .then((Sentry) => {
        Sentry.captureException(error, {
          extra: errorInfo,
        });
      })
      .catch(() => {
        // Silent catch - debug utility will handle any console logging
      });
  } catch {
    // Silent catch - debug utility will handle any console logging
  }
}

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

// Cache options to disable caching for auth-related calls
const disableCache = { cacheOptions: { enabled: false } };

// Define endpoints
const ENDPOINTS = {
  AUTH: "/auth-users",
  USERS: "/users",
  BOOKS: "/products",
  SETTINGS: "/settings",
};

// User details fields constant
export const USER_FIELDS =
  "id, name, email, image, password, expiry_date, is_admin, is_deleted, update_password, force_logout, force_password_reset, last_login, login_device_id, previous_device_id, device_token";

// User Actions
const UserActions = {
  getUsers: async (options = {}) => {
    try {
      const auth = store.auth.get();
      const response = await Api.get(ENDPOINTS.USERS, {
        filter: "is_deleted:0",
        session: auth.session || undefined,
        permissions: "{is_admin}:1",
        ...options,
      });
      return debug.log("Get Users", response);
    } catch (error) {
      return debug.error("Get Users", error);
    }
  },

  getUserDetails: async (id: string, options = {}) => {
    try {
      const auth = store.auth.get();
      // if (!auth?.session) throw new Error("Unauthorized");
      const response = await Api.get(`${ENDPOINTS.USERS}/${id}`, {
        filter: "is_deleted:0",
        // session: auth.session,
        // permissions: "{id}=={id}", // This ensures user can only access their own data
        ...options,
      });
      return debug.log("Get User Details", response);
    } catch (error) {
      return debug.error("Get User Details", error);
    }
  },

  updateUser: async (id: string, data: any, options = {}) => {
    try {
      const auth = store.auth.get();
      // if (!auth?.session) throw new Error("Unauthorized");

      // Create a new data object without modifying the original
      let updatedData = { ...data };

      // If device_token is null or empty, remove it from the data
      if (data && "device_token" in data && (!data.device_token || data.device_token === "")) {
        const { device_token, ...rest } = updatedData;
        updatedData = rest;
      }

      const response = await Api.put(`${ENDPOINTS.USERS}/${id}`, {
        body: updatedData,
        // session: auth.session,
        // permissions: "{id}=={id}", // This ensures user can only update their own data
        filter: "is_deleted:0",
        ...options,
      });
      return debug.log("Update User", response);
    } catch (error) {
      return debug.error("Update User", error);
    }
  },
};

// Auth Actions
const AuthActions = {
  handleLoginSuccess: async (loginResponse: any) => {
    if (loginResponse.err) {
      return { success: false, error: "Login failed" };
    }

    const { result, session } = loginResponse;

    // Get full user details after authentication
    // Wait for user details to be fetched and store to be updated
    const userDetailsResult = await AuthActions.getUserFullDetails(result.id, session);
    return userDetailsResult;
  },

  // Function to get complete user details and update store
  getUserFullDetails: async (userId: string, session: any) => {
    try {
      console.log("Getting user details for:", { userId });

      const userResponse = await Api.get(`${ENDPOINTS.USERS}/${userId}`, {
        fields: USER_FIELDS,
        filter: "is_deleted:0",
        // session: session,
        ...disableCache,
      });

      if (userResponse.err || !userResponse.result) {
        console.error("Failed to get user details:", userResponse.err);
        return { success: false, error: "Failed to get user details" };
      }

      // Handle result which might be an array or a single object
      const result = Array.isArray(userResponse.result) ? userResponse.result[0] : userResponse.result;

      if (!result) {
        console.error("No user details found");
        return { success: false, error: "No user details found" };
      }

      const { isSubscribed, isSubscriptionExpired } = checkSubscriptionStatus(result.expiry_date);

      console.log("Setting auth store with user:", {
        id: result.id,
        email: result.email,
        lastLogin: result.last_login,
        loginDeviceId: result.login_device_id,
      });

      store.auth.set({
        isLoggedIn: true,
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          image: result.image,
          password: result.password,
        },
        session,
        isAdmin: result.is_admin,
        isDeleted: result.is_deleted,
        expiryDate: result.expiry_date,
        isSubscribed,
        isSubscriptionExpired,
        updatePassword: result.update_password,
        forcePasswordReset: result.force_password_reset,
        forceLogout: result.force_logout,
        lastLogin: result.last_login,
        loginDeviceId: result.login_device_id,
        previousDeviceId: result.previous_device_id,
        deviceToken: result.device_token,
      });

      // Verify the auth state was set correctly
      const authState = store.auth.get();
      console.log("Auth state after update:", {
        isLoggedIn: authState.isLoggedIn,
        userId: authState.user?.id,
        email: authState.user?.email,
      });

      return { success: true };
    } catch (error) {
      console.error("Error getting user details:", error);
      return { success: false, error: "Failed to get user details" };
    }
  },

  handleLogout: () => {
    store.auth.set({
      isLoggedIn: false,
      user: { id: "", name: "", email: "", image: "", password: "" },
      session: null,
      isAdmin: false,
      isDeleted: false,
      expiryDate: null,
      isSubscribed: false,
      isSubscriptionExpired: false,
      updatePassword: false,
      forcePasswordReset: false,
      forceLogout: false,
      lastLogin: null,
      loginDeviceId: null,
      previousDeviceId: null,
      deviceToken: null,
    });

    return { success: true };
  },

  login: async (
    credentials: { email: string; password: string },
    options = {
      fields:
        "id, name, email, image, password, expiry_date, is_admin, is_deleted, update_password, force_logout, force_password_reset,last_login",
    },
    loginDeviceId?: string | null,
    deviceToken?: string | null
  ) => {
    try {
      const response = await Api.post(ENDPOINTS.AUTH, {
        body: credentials,
        ...options,
        ...disableCache,
      });

      if (!response.err) {
        // Generate a new device ID if not provided
        const newLoginDeviceId = loginDeviceId || generateDeviceId();

        // Prepare update data
        const updateData: any = {
          last_login: new Date().toISOString(),
          login_device_id: newLoginDeviceId,
          force_logout: 0, // Always reset force_logout flag on successful login
        };

        // Only add device token if it exists
        if (deviceToken) {
          updateData.device_token = deviceToken;
        }

        // Update last_login timestamp, device ID, and reset force_logout flag
        await Api.put(`${ENDPOINTS.USERS}/${response.result.id}`, {
          body: updateData,
          ...disableCache,
        });

        // Add device ID to the response
        response.result.login_device_id = newLoginDeviceId;
        if (deviceToken) {
          response.result.device_token = deviceToken;
        }
      }

      return debug.log("Login", response);
    } catch (error) {
      return debug.error("Login", error);
    }
  },

  checkUserExists: async (email: string, options = {}) => {
    try {
      const response = await Api.get(ENDPOINTS.USERS, {
        filter: `is_deleted:0`,
        search: `email:${email}`,
        ...options,
        ...disableCache,
      });
      return debug.log("Check User", response);
    } catch (error: any) {
      return debug.error("Check User", error);
    }
  },

  signup: async (
    userData: { email: string; password: string; name: string },
    options = {},
    loginDeviceId?: string | null,
    deviceToken?: string | null
  ) => {
    try {
      console.log("Starting signup process", { email: userData.email, deviceId: loginDeviceId });

      // If no device ID provided, generate one or use the one from the store
      const deviceId = loginDeviceId || store.auth.get().loginDeviceId || generateDeviceId();
      const dToken = deviceToken || store.auth.get().deviceToken;

      // First create user with caching disabled
      const createUserResponse = await AuthActions.createUser(
        userData,
        { ...options, ...disableCache },
        deviceId,
        dToken
      );

      return debug.log("Signup complete", createUserResponse);
    } catch (error) {
      console.error("Signup failed:", error);
      // Clear out any potentially cached requests to prevent unresponsive buttons
      clearCache();
      return debug.error("Signup", error);
    }
  },

  createUser: async (
    userData: { email: string; password: string; name: string },
    options = {},
    loginDeviceId?: string | null,
    deviceToken?: string | null
  ) => {
    try {
      // Check if user exists first - with caching disabled
      const existingUser: any = await AuthActions.checkUserExists(userData.email, disableCache);
      if (!existingUser.err && existingUser.result?.length > 0) {
        return { err: true, result: "Email already registered" };
      }

      // Hash password before creating user
      const hashedPassword = await hashPassword(userData.password);

      // Create user with caching disabled
      const response = await Api.post(ENDPOINTS.USERS, {
        body: {
          ...userData,
          password: hashedPassword,
          force_logout: false,
          force_password_reset: false,
          is_deleted: 0,
        },
        ...options,
        ...disableCache,
      });

      if (!response.err) {
        // If user creation successful, attempt login - with caching disabled
        const loginResponse = await AuthActions.login(
          {
            email: userData.email,
            password: hashedPassword, // Use hashed password for login
          },
          { fields: "id", ...disableCache }, // Pass options as the second parameter
          loginDeviceId,
          deviceToken
        );

        // Explicitly set auth state after signup
        const userDetailsResult = await AuthActions.handleLoginSuccess(loginResponse);
        if (!userDetailsResult.success) {
          console.error("Failed to get user details after signup:", userDetailsResult.error);
          return { err: true, result: "Login failed after signup" };
        }

        // Return properly structured response with auth state flag
        return {
          ...loginResponse,
          auth_state_set: true, // Add flag indicating auth state was set
        };
      }

      return { err: true, result: "Failed to create account" };
    } catch (error: any) {
      console.error("Error during user creation:", error);
      return { err: true, result: "Failed to create account" };
    }
  },

  resetPassword: async (userId: number, hashedPassword: string, options = {}) => {
    try {
      const response = await Api.put(`${ENDPOINTS.USERS}/${userId}`, {
        body: { password: hashedPassword },
        ...options,
      });
      return debug.log("Reset Password", response);
    } catch (error) {
      return debug.error("Reset Password", error);
    }
  },
};

// Force Flag Actions
const ForceFlagActions = {
  updateForceFlags: async (
    userId: string,
    flags: { force_password_reset?: number; force_logout?: number },
    options = {}
  ) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response = await Api.put(`${ENDPOINTS.USERS}/${userId}`, {
        body: flags,
        filter: "is_deleted:0",
        // session: auth.session,
        // permissions: "{role}==admin",
        ...options,
      });
      return debug.log("Update Force Flags", response);
    } catch (error) {
      return debug.error("Update Force Flags", error);
    }
  },

  checkForceFlags: async (userId: string, options = {}) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response = await Api.get(`${ENDPOINTS.USERS}/${userId}`, {
        // session: auth.session,
        // filter: !auth.isAdmin ? `id:${auth.user.id}` : undefined,
        ...options,
      });
      return debug.log("Check Force Flags", response);
    } catch (error) {
      return debug.error("Check Force Flags", error);
    }
  },
};

// Book Actions
const BookActions = {
  createBook: async (data: any, options = {}) => {
    try {
      const auth = store.auth.get();
      // if (!auth?.session) throw new Error("No session found");
      const response = await Api.post(ENDPOINTS.BOOKS, {
        body: formatBookData(data),
        // session: auth.session ,
        // permissions: "{id}=={id}", // This ensures user can only create data for themselves
        ...options,
      });
      sendToNative({ type: "createBook", data: response });
      return debug.log("Create Book", response);
    } catch (error) {
      return debug.error("Create Book", error);
    }
  },

  updateBook: async (id: string, data: any, options = {}) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response = await Api.put(`${ENDPOINTS.BOOKS}/${id}`, {
        body: formatBookData(data),
        // session: auth.session,
        // permissions: "{role}==admin",
        ...options,
      });
      return debug.log("Update Book", response);
    } catch (error) {
      return debug.error("Update Book", error);
    }
  },

  getBooks: async (options = {}) => {
    const defaultOptions = { sort: "-created_at", filter: "is_deleted:0" };
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response: any = await Api.get(ENDPOINTS.BOOKS, {
        ...defaultOptions,
        // session: auth.session,
        ...options,
      });
      if (!response.err && Array.isArray(response.result)) {
        response.result = response.result.map((book: any) => formatBookData(book));
      }
      return debug.log("Get Books", response);
    } catch (error) {
      return debug.error("Get Books", error);
    }
  },

  getBook: async (id: string, options = {}) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response: any = await Api.get(`${ENDPOINTS.BOOKS}/${id}`, {
        filter: "is_deleted:0",
        // session: auth.session,
        ...options,
      });
      if (!response.err && response.result) {
        response.result = formatBookData(response.result);
      }
      return debug.log("Get Book", response);
    } catch (error) {
      return debug.error("Get Book", error);
    }
  },

  deleteBook: async (id: string, options = {}) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response = await Api.put(`${ENDPOINTS.BOOKS}/${id}`, {
        body: { is_deleted: 1 },
        // session: auth.session,
        // permissions: "{role}==admin",
        ...options,
      });
      return debug.log("Delete Book", response);
    } catch (error) {
      return debug.error("Delete Book", error);
    }
  },
};

// Settings Actions
const SettingsActions = {
  getSettings: async (options = {}) => {
    try {
      // const auth = store.auth.get();
      // if (!auth.session) throw new Error("No session found");
      const response: any = await Api.get(ENDPOINTS.SETTINGS, {
        // session: auth.session,
        ...options,
      });
      return debug.log("Get Settings", response);
    } catch (error) {
      return debug.error("Get Settings", error);
    }
  },
};

// Media Actions
const MediaActions = {
  uploadMedia: async (file: File, folderName: string) => {
    try {
      const formData = new FormData();
      let fileToUpload = file;

      // Only compress if it's an image file
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(file);
        if (!compressed) throw new Error("Failed to compress image");
        fileToUpload = compressed;
      }

      const appName = import.meta.env.VITE_UPLOAD_DIR.split(" ").join("-").toLocaleLowerCase();
      formData.append("folder", `${appName}/${folderName}`);
      formData.append("image", fileToUpload);

      const { data } = await axios.post(import.meta.env.VITE_IMAGE_UPLOAD_URL!, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          username: import.meta.env.VITE_UPLOAD_ID,
          password: import.meta.env.VITE_UPLOAD_PASS,
        },
      });
      // console.log("data", data);
      return data;
    } catch (error) {
      return debug.error("Upload Media", error);
    }
  },
};

// Helper functions
function generateDeviceId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

// Export all actions
export const getUsers = UserActions.getUsers;
export const getUserDetails = UserActions.getUserDetails;
export const updateUser = UserActions.updateUser;

export const handleLoginSuccess = AuthActions.handleLoginSuccess;
export const getUserFullDetails = AuthActions.getUserFullDetails;
export const handleLogout = AuthActions.handleLogout;
export const login = AuthActions.login;
export const checkUserExists = AuthActions.checkUserExists;
export const signup = AuthActions.signup;
export const createUser = AuthActions.createUser;
export const resetPassword = AuthActions.resetPassword;

export const updateForceFlags = ForceFlagActions.updateForceFlags;
export const checkForceFlags = ForceFlagActions.checkForceFlags;

export const createBook = BookActions.createBook;
export const updateBook = BookActions.updateBook;
export const getBooks = BookActions.getBooks;
export const getBook = BookActions.getBook;
export const deleteBook = BookActions.deleteBook;

export const getSettings = SettingsActions.getSettings;

export const uploadMedia = MediaActions.uploadMedia;

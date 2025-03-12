import Api from "./api";
import { axios } from "@/lib/vendors";
import { compressImage } from "@/lib/utils/image-compression";
import { formatBookData } from "@/lib/utils/text-utils";
import { hashPassword } from "@/lib/utils/utils";
import { checkSubscriptionStatus } from "@/lib/utils/session";
import { store } from "@/services/store";

// Debug utility
const debug = {
  log: (message: string, data: any) => {
    console.log(`[DEBUG] ${message}:`, data);
    return data;
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR ❌ ] ${message}:`, error);
    throw error;
  },
};

// Create auth API instance
const authApi = Api.auth("auth-users");

// Create resource instances
const userApi = Api.resource("users");
const bookApi = Api.resource("products");
const settingsApi = Api.resource("settings");

// User Actions

export async function getUserDetails(id: string, options = {}) {
  try {
    const response = await userApi.getOne(id, {
      filter: "is_deleted:0",
      ...options,
    });
    return debug.log("Get User Details", response);
  } catch (error) {
    return debug.error("Get User Details", error);
  }
}

export async function updateUser(id: string, data: any, options = {}) {
  try {
    const response = await userApi.update(id, data as Partial<any>, options);
    return debug.log("Update User", response);
  } catch (error) {
    return debug.error("Update User", error);
  }
}

// Auth Actions
export function handleLoginSuccess(loginResponse: any) {
  if (loginResponse.err) {
    return { success: false, error: "Login failed" };
  }

  const { result, session } = loginResponse;
  const { isSubscribed, isSubscriptionExpired } = checkSubscriptionStatus(result.expiry_date);

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
  });

  return { success: true };
}

export function handleLogout() {
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
  });

  return { success: true };
}

export async function login(
  credentials: { email: string; password: string },
  options = {
    fields:
      "id, name, email, image, password, expiry_date, is_admin, is_deleted, update_password, force_logout, force_password_reset,last_login",
  }
) {
  try {
    const response = await authApi.check(credentials, options);
    if (!response.err) {
      // Update last_login timestamp
      await userApi.update(response.result.id, {
        last_login: new Date().toISOString(),
      });
    }

    return debug.log("Login", response);
  } catch (error) {
    return debug.error("Login", error);
  }
}

export async function checkUserExists(email: string, options = {}) {
  try {
    const response = await userApi.getAll({
      filter: `is_deleted:0`,
      search: `email:${email}`,
      ...options,
    });
    return debug.log("Check User", response);
  } catch (error: any) {
    return debug.error("Check User", error);
  }
}

export async function signup(
  userData: { email: string; password: string; name: string; phone?: string },
  options = {}
) {
  try {
    // First create user
    const createUserResponse = await createUser(userData);
    return debug.log("Signup", createUserResponse);
  } catch (error) {
    return debug.error("Signup", error);
  }
}

export async function createUser(
  userData: { email: string; password: string; name: string; phone?: string },
  options = {}
) {
  try {
    // Check if user exists first
    const existingUser: any = await checkUserExists(userData.email);
    if (!existingUser.err && existingUser.result?.length > 0) {
      return { err: true, result: "Email already registered" };
    }

    // Hash password before creating user
    const hashedPassword = await hashPassword(userData.password);

    const response = await userApi.create({
      ...userData,
      password: hashedPassword,
      force_logout: false,
      force_password_reset: false,
      is_deleted: 0,
    });

    if (!response.err) {
      // If user creation successful, attempt login
      const loginResponse = await login({
        email: userData.email,
        password: userData.password, // Use original password for login
      });

      const { success } = handleLoginSuccess(loginResponse);
      if (!success) {
        return { err: true, result: "Login failed after signup" };
      }
      return loginResponse;
    }

    return { err: true, result: "Failed to create account" };
  } catch (error: any) {
    return { err: true, result: "Failed to create account" };
  }
}

export const resetPassword = async (userId: number, hashedPassword: string, options = {}) => {
  try {
    const response = await userApi.update(userId, { password: hashedPassword, ...options });
    return debug.log("Reset Password", response);
  } catch (error) {
    return debug.error("Reset Password", error);
  }
};

// Force Flag Actions
export async function updateForceFlags(
  userId: string,
  flags: { force_password_reset?: number; force_logout?: number },
  options = {}
) {
  try {
    const response = await userApi.update(userId, flags, options);
    return debug.log("Update Force Flags", response);
  } catch (error) {
    return debug.error("Update Force Flags", error);
  }
}

export async function checkForceFlags(userId: string, options = {}) {
  try {
    const response = await userApi.getOne(userId, options);
    return debug.log("Check Force Flags", response);
  } catch (error) {
    return debug.error("Check Force Flags", error);
  }
}

// Book Actions
export async function createBook(data: any, options = {}) {
  try {
    const response = await bookApi.create(formatBookData(data), options);
    return debug.log("Create Book", response);
  } catch (error) {
    return debug.error("Create Book", error);
  }
}

export async function updateBook(id: string, data: any, options = {}) {
  try {
    const response = await bookApi.update(id, formatBookData(data), options);
    return debug.log("Update Book", response);
  } catch (error) {
    return debug.error("Update Book", error);
  }
}

export async function getBooks(options = { sort: "-created_at", filter: "is_deleted:0" }) {
  try {
    const response: any = await bookApi.getAll(options);
    if (!response.err && Array.isArray(response.result)) {
      response.result = response.result.map((book: any) => formatBookData(book));
    }
    return debug.log("Get Books", response);
  } catch (error) {
    return debug.error("Get Books", error);
  }
}

export async function getBook(id: string, options = { filter: "is_deleted:0" }) {
  try {
    const response: any = await bookApi.getOne(id, options);
    if (!response.err && Array.isArray(response.result)) {
      response.result = response.result.map((book: any) => formatBookData(book));
    }
    return debug.log("Get Book", response);
  } catch (error) {
    return debug.error("Get Book", error);
  }
}

export async function deleteBook(id: string, options = {}) {
  try {
    const response = await bookApi.update(id, { is_deleted: 1 }, options);
    return debug.log("Delete Book", response);
  } catch (error) {
    return debug.error("Delete Book", error);
  }
}

// Settings Actions
export async function getSettings(options = {}) {
  try {
    const response: any = await settingsApi.getAll(options);
    return debug.log("Get Settings", response);
  } catch (error) {
    return debug.error("Get Settings", error);
  }
}

export async function uploadMedia(file: File, folderName: string) {
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
}

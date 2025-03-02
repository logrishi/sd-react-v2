import Api from "./api";
import { axios } from "@/lib/vendors";
import { compressImage } from "@/lib/utils/image-compression";
import { formatBookData } from "@/lib/utils/text-utils";
import { hashPassword } from "@/lib/utils/utils";

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

// Create resource instances
const userApi = Api.resource("users");
const bookApi = Api.resource("products");
const orderApi = Api.resource("orders");

// User Actions
export async function getUser(id: string, options = {}) {
  try {
    const response = await userApi.getOne(id, options);
    return debug.log("Get User", response);
  } catch (error) {
    return debug.error("Get User", error);
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
export async function login(credentials: { email: string; password: string }, options = {}) {
  try {
    const response = await Api.post("/auth-users", {
      body: credentials,
      ...options,
    });
    return debug.log("Login", response);
  } catch (error) {
    return debug.error("Login", error);
  }
}

export async function checkUserExists(email: string, options = {}) {
  try {
    const response = await Api.get("/users", {
      filter: `email:${email}`,
      ...options,
    });
    return debug.log("Check User", response);
  } catch (error) {
    return debug.error("Check User", error);
  }
}

export async function createUser(userData: { email: string; password: string; name: string; phone?: string }) {
  try {
    // Check if user exists first
    const existingUser: any = await checkUserExists(userData.email);
    if (!existingUser.err && existingUser.result?.length > 0) {
      return { err: true, result: "Email already registered" };
    }

    // Hash password before creating user
    const hashedPassword = await hashPassword(userData.password);

    const response = await Api.post("/users", {
      body: {
        ...userData,
        password: hashedPassword,
        force_logout: false,
        force_password_reset: false,
      },
    });

    if (!response.err) {
      // If user creation successful, attempt login
      return await login({
        email: userData.email,
        password: hashedPassword, // Use original password for login
      });
    }

    return { err: true, result: response.result || "Failed to create account" };
  } catch (error: any) {
    return { err: true, result: error?.message || "Failed to create account" };
  }
}

export async function signup(userData: { email: string; password: string; name: string; phone?: string }) {
  try {
    // First create user
    const createUserResponse = await createUser(userData);
    return debug.log("Signup", createUserResponse);
  } catch (error) {
    return debug.error("Signup", error);
  }
}

export const resetPassword = async (email: string) => {};

// Force Flag Actions
export async function updateForceFlags(
  userId: string,
  flags: { forcePasswordReset?: boolean; forceLogout?: boolean },
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
export async function createBook(data: any) {
  try {
    const response = await bookApi.create(formatBookData(data));
    return debug.log("Create Book", response);
  } catch (error) {
    return debug.error("Create Book", error);
  }
}

export async function updateBook(id: string, data: any) {}

export async function getBooks() {
  try {
    const response = await bookApi.getAll();
    return debug.log("Get Books", response);
  } catch (error) {
    return debug.error("Get Books", error);
  }
}

export async function getBook(id: string, options = {}) {
  try {
    const response = await bookApi.getOne(id, options);
    return debug.log("Get Book", response);
  } catch (error) {
    return debug.error("Get Book", error);
  }
}

export async function deleteBook(id: string, options = {}) {
  try {
    const response = await bookApi.remove(id, options);
    return debug.log("Delete Book", response);
  } catch (error) {
    return debug.error("Delete Book", error);
  }
}

// Order Actions
export async function getOrder(id: string, options = {}) {
  try {
    const response = await orderApi.getOne(id, options);
    return debug.log("Get Order", response);
  } catch (error) {
    return debug.error("Get Order", error);
  }
}

export async function createOrder(data: any, options = {}) {
  try {
    const response = await orderApi.create(data, options);
    return debug.log("Create Order", response);
  } catch (error) {
    return debug.error("Create Order", error);
  }
}

export async function updateOrder(id: string, data: any, options = {}) {
  try {
    const response = await orderApi.update(id, data, options);
    return debug.log("Update Order", response);
  } catch (error) {
    return debug.error("Update Order", error);
  }
}

export async function uploadMedia(image: File, folderName: string) {
  const formData = new FormData();

  const compressed = await compressImage(image);
  if (!compressed) throw new Error("Failed to compress image");

  const appName = import.meta.env.VITE_UPLOAD_DIR.split(" ").join("-").toLocaleLowerCase();
  formData.append("folder", `${appName}/${folderName}`);
  formData.append("image", compressed);

  const { data } = await axios.post(import.meta.env.VITE_IMAGE_UPLOAD_URL!, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      username: import.meta.env.VITE_UPLOAD_ID,
      password: import.meta.env.VITE_UPLOAD_PASS,
    },
  });
  return data;
}

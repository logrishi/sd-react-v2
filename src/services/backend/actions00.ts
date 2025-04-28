import { hashPassword, sendToNative } from "@/lib/utils/utils";

import Api from "./api-old";
import { axios } from "@/lib/vendors";
import { clearCache } from "./cache";
// import { checkSubscriptionStatus } from "@/lib/utils/session";
import { compressImage } from "@/lib/utils/image-compression";
import { formatBookData } from "@/lib/utils/text-utils";
import { store } from "@/services/store";

export async function getUsers(options = {}) {
  try {
    const auth = store.auth.get();

    // Check if user is authenticated with a valid session
    if (!auth?.session) {
      return { err: true, result: "Unauthorized: No session found" };
    }

    console.log("Auth session:", auth.session);

    // Make the API call with session and permissions
    const response = await Api.get("/users", {
      filter: { is_deleted: 0 },
      session: auth.session,
      permissions: { is_admin: 1 },
      ...options,
    });

    console.log("API Response:", response);
    return response;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { err: true, result: error.message };
  }
}

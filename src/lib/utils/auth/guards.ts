import { store } from "@/services/store";

// Auth guard utility for route protection
export function authGuard() {
  const { isLoggedIn } = store.auth.get();
  if (!isLoggedIn) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

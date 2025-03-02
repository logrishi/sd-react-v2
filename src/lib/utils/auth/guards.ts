import { store } from "../../store/store";

// Auth guard utility for route protection
export function authGuard() {
  const { isAuthenticated } = store.auth.get();
  if (!isAuthenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

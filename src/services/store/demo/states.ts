// Demo state types and patterns

// 1. Basic Counter - Direct State
export const counter = {
  count: 0,
};

// 2. Theme - Direct State with Persistence
export const theme = {
  mode: "light" as "light" | "dark",
  persist: true,
};

// 3. Todo List - Array State
export const todos = {
  items: [] as { id: string; text: string; completed: boolean }[],
  filter: "all" as "all" | "active" | "completed",
};

// 4. Form - Wrapped State
export const form = {
  value: {
    username: "",
    email: "",
    age: 0,
    isValid: false,
  },
};

// 5. Settings - Wrapped State with Full Persistence
export const settings = {
  value: {
    notifications: true,
    fontSize: 14,
    language: "en",
    timezone: "UTC",
  },
  persist: true,
};

// 6. Shopping Cart - Complex State with Selective Persistence
export const cart = {
  items: [] as { id: string; name: string; price: number; quantity: number }[],
  total: 0,
  lastUpdated: "",
  recentlyViewed: [] as string[],
  persist: ["recentlyViewed"], // Only persist recently viewed items
};

// Export all states
export const store = {
  counter,
  theme,
  todos,
  form,
  settings,
  cart,
};

// All state definitions in a single object
export const store = {
  // 1. Direct state (no persist)
  counter: {
    count: 0,
  },

  // 2. Direct state with persist
  theme: {
    mode: "light",
    persist: true,
  },

  // 3. Auth state
  auth: {
    user: {},
    token: null,
    isLoggedIn: false,
    isAdmin: false,
    persist: true,
  },

  // 4. Settings state
  settings: {
    fontSize: 14,
    language: "en",
    notifications: true,
    persist: true,
  },

  // 5. Library state with selective persist
  library: {
    books: [],
    searchQuery: "",
    selectedCategory: "all",
    recentlyViewed: [],
    persist: ["recentlyViewed"],
  },

  // 6. Workspace state
  workspace: {
    currentProject: null,
    openFiles: [],
    layout: {
      sidebar: true,
      terminal: false,
    },
    history: [],
    preferences: {
      autoSave: true,
      theme: "default",
    },
    persist: true,
  },
};

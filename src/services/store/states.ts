// Define the store with the correct format according to documentation
export const store = {
  auth: {
    user: null,
    token: null,
    session: null,
    isAuthenticated: false,
    isAdmin: false,
    forcePasswordReset: false,
    forceLogout: false,
    persist: true,
  },

  form: {
    value: {
      passwordStrength: 0,
      formErrors: {},
      isSubmitting: false,
    },
  },

  library: {
    books: [],
    searchQuery: "",
    selectedCategory: "all",
  },

  theme: {
    mode: "light",
    persist: true,
  },

  // Example of selective persistence as shown in docs
  cart: {
    items: [],
    recentlyViewed: [],
    persist: ["recentlyViewed"], // Only persist specific fields
  },
};

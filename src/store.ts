// Define the store with the correct format according to documentation
export const store = {
  auth: {
    user: {},
    token: null,
    session: null,
    isLoggedIn: false,
    isAdmin: false,
    forcePasswordReset: false,
    forceLogout: false,
    persist: true,
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

  form: {
    value: {
      passwordStrength: 0,
      formErrors: {},
      isSubmitting: false,
    },
  },

  cart: [],
};

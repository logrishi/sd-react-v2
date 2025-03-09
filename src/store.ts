// Define the store with the correct format according to documentation
export const store = {
  auth: {
    user: { id: "", name: "", email: "", image: "", password: "" },
    session: null,
    isLoggedIn: false,
    isAdmin: false,
    isDeleted: false,
    expiryDate: null,
    isSubscribed: false,
    isSubscriptionExpired: false,
    updatePassword: false,
    forcePasswordReset: false,
    forceLogout: false,
    lastLogin: null,
    persist: true,
  },

  library: {
    books: [],
    searchQuery: "",
    selectedCategory: "all",
  },

  product: {
    currentProduct: null,
    reviews: [],
    isLoading: false,
    error: null,
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

  bookmark: {
    books: [],
    persist: true,
  },

  cart: [],
  otp: {
    otp: "",
    timestamp: 0,
    persist: true,
  },
};

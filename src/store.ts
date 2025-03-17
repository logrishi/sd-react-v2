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
    loginDeviceId: null,
    previousDeviceId: null,
    deviceToken: null,
    persist: true,
  },

  library: {
    books: [],
    searchQuery: "",
    selectedCategory: "",
    showFreeOnly: false,
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

  isNative: {
    isNative: false,
    persist: true,
  },

  otp: {
    otp: "",
    timestamp: 0,
    persist: true,
  },
  isOtaAvailable: {
    isOtaAvailable: false,
    persist: true,
  },
  isDev: {
    isDev: false,
    persist: true,
  },
  isUpdateAvailable: {
    isUpdateAvailable: false,
    persist: true,
  },
  applicationVersion: {
    applicationVersion: "",
    persist: true,
  },
  buildVersion: {
    buildVersion: "",
    persist: true,
  },

  payment: {
    currentPayment: {
      txnId: "",
      timestamp: 0,
      userId: "",
    },
    persist: false,
  },

  appSettings: {
    categories: [] as string[],
    price: 0,
    persist: true,
  },
};

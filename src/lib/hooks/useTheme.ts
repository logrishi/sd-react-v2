import { store } from "@/services/store";

/**
 * Hook for managing theme state and operations
 * Provides functions to toggle theme and check current theme
 */
export const useTheme = () => {
  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const currentTheme = store.theme.get().mode;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    store.theme.set({ mode: newTheme });
    
    // Update the document class for tailwind dark mode
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  /**
   * Get current theme
   */
  const getTheme = () => {
    return store.theme.get().mode;
  };

  /**
   * Check if current theme is dark
   */
  const isDarkTheme = () => {
    return store.theme.get().mode === "dark";
  };

  return {
    toggleTheme,
    getTheme,
    isDarkTheme
  };
};

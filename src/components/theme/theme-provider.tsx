import { useEffect } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { getTheme } = useTheme();
  
  useEffect(() => {
    // Initialize theme from store on first load
    const theme = getTheme();
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (getTheme() === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [getTheme]);

  return <>{children}</>;
}

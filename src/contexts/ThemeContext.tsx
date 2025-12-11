import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";
import type { Theme, ResolvedTheme } from "../hooks/useTheme";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isAuto: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that provides theme state and functions to the entire app
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeHook = useTheme();

  return (
    <ThemeContext.Provider value={themeHook}>{children}</ThemeContext.Provider>
  );
};

/**
 * Custom hook to consume the theme context
 * Must be used within a ThemeProvider
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
};

// Export the context for advanced use cases
export { ThemeContext };

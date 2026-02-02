import { useState, useEffect, useCallback } from "react";
import { fetchActiveTheme, type ThemeConfig, type ThemeColors } from "../services/api";

export type Theme = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  customTheme: ThemeConfig | null;
}

const STORAGE_KEY = "life-log-theme";

// Time-based theme configuration (24-hour format)
const DARK_MODE_START_HOUR = 18; // 6:00 PM
const DARK_MODE_END_HOUR = 7; // 7:00 AM

/**
 * Determines if it's currently night time based on the device clock
 */
const isNightTime = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  // Dark mode from 6 PM to 7 AM
  if (DARK_MODE_START_HOUR > DARK_MODE_END_HOUR) {
    // Spans midnight (e.g., 18:00 to 07:00)
    return (
      currentHour >= DARK_MODE_START_HOUR || currentHour < DARK_MODE_END_HOUR
    );
  } else {
    // Same day (e.g., 20:00 to 23:00)
    return (
      currentHour >= DARK_MODE_START_HOUR && currentHour < DARK_MODE_END_HOUR
    );
  }
};

/**
 * Gets the system preference for dark mode
 */
// const getSystemPreference = (): ResolvedTheme => {
//   if (typeof window !== "undefined" && window.matchMedia) {
//     return window.matchMedia("(prefers-color-scheme: dark)").matches
//       ? "dark"
//       : "light";
//   }
//   return "light";
// };

/**
 * Resolves the actual theme to apply based on user preference and conditions
 */
const resolveTheme = (theme: Theme): ResolvedTheme => {
  switch (theme) {
    case "light":
      return "light";
    case "dark":
      return "dark";
    case "auto":
      // Use time-based switching for auto mode
      return isNightTime() ? "dark" : "light";
    default:
      return "light";
  }
};

/**
 * Applies theme colors as CSS variables
 */
const applyThemeColors = (colors: ThemeColors, typography?: ThemeConfig["typography"]) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Apply colors
  root.style.setProperty("--text-color", colors.text);
  root.style.setProperty("--secondary-color", colors.secondary);
  root.style.setProperty("--thirdary-color", colors.tertiary);
  root.style.setProperty("--paper-color", colors.paper);
  root.style.setProperty("--background-color", colors.background);
  root.style.setProperty("--border-color", colors.border);
  root.style.setProperty("--accent-color", colors.accent);
  root.style.setProperty("--error-text", colors.error);
  root.style.setProperty("--success-text", colors.success);

  // Apply typography if provided
  if (typography) {
    root.style.setProperty("--font-family", typography.fontFamily);
    root.style.setProperty("--font-size", typography.fontSize);
    root.style.setProperty("--line-height", String(typography.lineHeight));
    document.body.style.fontFamily = typography.fontFamily;
    document.body.style.fontSize = typography.fontSize;
    document.body.style.lineHeight = String(typography.lineHeight);
  }
};

/**
 * Custom hook for theme management with time-based auto-switching
 */
export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // Initialize from localStorage or default to 'auto'
    const storedTheme =
      (typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as Theme)
        : null) || "auto";

    const resolvedTheme = resolveTheme(storedTheme);

    return {
      theme: storedTheme,
      resolvedTheme,
      customTheme: null,
    };
  });

  /**
   * Updates the DOM to reflect the current theme
   */
  const updateDOM = useCallback((resolvedTheme: ResolvedTheme, customTheme?: ThemeConfig | null) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", resolvedTheme);

      // Apply custom theme colors if available
      if (customTheme) {
        const colors = resolvedTheme === "dark" ? customTheme.darkColors : customTheme.colors;
        applyThemeColors(colors, customTheme.typography);
      }

      // Also update body background for immediate visual feedback
      document.body.style.backgroundColor = "var(--background-color)";
      document.body.style.color = "var(--text-color)";
    }
  }, []);

  /**
   * Sets the theme and persists to localStorage
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      const resolvedTheme = resolveTheme(newTheme);

      setThemeState((prev) => ({
        ...prev,
        theme: newTheme,
        resolvedTheme,
      }));

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }

      // Update DOM with custom theme if available
      setThemeState((prev) => {
        updateDOM(resolvedTheme, prev.customTheme);
        return prev;
      });
    },
    [updateDOM]
  );

  /**
   * Loads the custom theme from the API
   */
  const loadCustomTheme = useCallback(async () => {
    try {
      const activeTheme = await fetchActiveTheme();
      setThemeState((prev) => {
        const newState = { ...prev, customTheme: activeTheme.config };
        updateDOM(prev.resolvedTheme, activeTheme.config);
        return newState;
      });
    } catch (error) {
      console.error("Failed to load custom theme:", error);
      // Continue with default CSS variables
    }
  }, [updateDOM]);

  /**
   * Reloads the custom theme (call after theme changes)
   */
  const reloadCustomTheme = useCallback(() => {
    loadCustomTheme();
  }, [loadCustomTheme]);

  /**
   * Toggles between light and dark themes (sets to manual mode)
   */
  const toggleTheme = useCallback(() => {
    const newTheme = themeState.resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [themeState.resolvedTheme, setTheme]);

  // Effect to handle time-based switching when in auto mode
  useEffect(() => {
    if (themeState.theme !== "auto") return;

    const checkTime = () => {
      const newResolvedTheme = resolveTheme("auto");
      if (newResolvedTheme !== themeState.resolvedTheme) {
        setThemeState((prev) => ({
          ...prev,
          resolvedTheme: newResolvedTheme,
        }));
        updateDOM(newResolvedTheme);
      }
    };

    // Check every minute for time-based changes
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [themeState.theme, themeState.resolvedTheme, updateDOM]);

  // Effect to handle system preference changes when in auto mode
  useEffect(() => {
    if (themeState.theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // When system preference changes, re-evaluate the theme
      const newResolvedTheme = resolveTheme("auto");
      if (newResolvedTheme !== themeState.resolvedTheme) {
        setThemeState((prev) => ({
          ...prev,
          resolvedTheme: newResolvedTheme,
        }));
        updateDOM(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeState.theme, themeState.resolvedTheme, updateDOM]);

  // Effect to apply theme on mount and when resolvedTheme changes
  useEffect(() => {
    updateDOM(themeState.resolvedTheme, themeState.customTheme);
  }, [themeState.resolvedTheme, themeState.customTheme, updateDOM]);

  // Effect to load custom theme on mount
  useEffect(() => {
    loadCustomTheme();
  }, [loadCustomTheme]);

  return {
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    customTheme: themeState.customTheme,
    setTheme,
    toggleTheme,
    reloadCustomTheme,
    isAuto: themeState.theme === "auto",
    isDark: themeState.resolvedTheme === "dark",
  };
};

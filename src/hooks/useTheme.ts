import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = 'life-log-theme';

// Time-based theme configuration (24-hour format)
const DARK_MODE_START_HOUR = 18; // 6:00 PM
const DARK_MODE_END_HOUR = 7;    // 7:00 AM

/**
 * Determines if it's currently night time based on the device clock
 */
const isNightTime = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  // Dark mode from 6 PM to 7 AM
  if (DARK_MODE_START_HOUR > DARK_MODE_END_HOUR) {
    // Spans midnight (e.g., 18:00 to 07:00)
    return currentHour >= DARK_MODE_START_HOUR || currentHour < DARK_MODE_END_HOUR;
  } else {
    // Same day (e.g., 20:00 to 23:00)
    return currentHour >= DARK_MODE_START_HOUR && currentHour < DARK_MODE_END_HOUR;
  }
};

/**
 * Gets the system preference for dark mode
 */
const getSystemPreference = (): ResolvedTheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Resolves the actual theme to apply based on user preference and conditions
 */
const resolveTheme = (theme: Theme): ResolvedTheme => {
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'auto':
      // Use time-based switching for auto mode
      return isNightTime() ? 'dark' : 'light';
    default:
      return 'light';
  }
};

/**
 * Custom hook for theme management with time-based auto-switching
 */
export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // Initialize from localStorage or default to 'auto'
    const storedTheme = (typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY) as Theme
      : null) || 'auto';

    const resolvedTheme = resolveTheme(storedTheme);

    return {
      theme: storedTheme,
      resolvedTheme
    };
  });

  /**
   * Updates the DOM to reflect the current theme
   */
  const updateDOM = useCallback((resolvedTheme: ResolvedTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);

      // Also update body background for immediate visual feedback
      document.body.style.backgroundColor = resolvedTheme === 'dark'
        ? 'var(--background-color)'
        : 'var(--background-color)';
      document.body.style.color = resolvedTheme === 'dark'
        ? 'var(--text-color)'
        : 'var(--text-color)';
    }
  }, []);

  /**
   * Sets the theme and persists to localStorage
   */
  const setTheme = useCallback((newTheme: Theme) => {
    const resolvedTheme = resolveTheme(newTheme);

    setThemeState({
      theme: newTheme,
      resolvedTheme
    });

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }

    // Update DOM
    updateDOM(resolvedTheme);
  }, [updateDOM]);

  /**
   * Toggles between light and dark themes (sets to manual mode)
   */
  const toggleTheme = useCallback(() => {
    const newTheme = themeState.resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [themeState.resolvedTheme, setTheme]);

  // Effect to handle time-based switching when in auto mode
  useEffect(() => {
    if (themeState.theme !== 'auto') return;

    const checkTime = () => {
      const newResolvedTheme = resolveTheme('auto');
      if (newResolvedTheme !== themeState.resolvedTheme) {
        setThemeState(prev => ({
          ...prev,
          resolvedTheme: newResolvedTheme
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
    if (themeState.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // When system preference changes, re-evaluate the theme
      const newResolvedTheme = resolveTheme('auto');
      if (newResolvedTheme !== themeState.resolvedTheme) {
        setThemeState(prev => ({
          ...prev,
          resolvedTheme: newResolvedTheme
        }));
        updateDOM(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeState.theme, themeState.resolvedTheme, updateDOM]);

  // Effect to apply theme on mount and when resolvedTheme changes
  useEffect(() => {
    updateDOM(themeState.resolvedTheme);
  }, [themeState.resolvedTheme, updateDOM]);

  return {
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme,
    toggleTheme,
    isAuto: themeState.theme === 'auto',
    isDark: themeState.resolvedTheme === 'dark'
  };
};

// Explicit re-export of types for better compatibility
export type { Theme, ResolvedTheme };
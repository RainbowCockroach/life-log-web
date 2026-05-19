import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { applyTheme, resolveMode } from "./applyTheme";
import { DEFAULT_THEME_KEY, getTheme, listThemes } from "./themes";
import type { Mode, ResolvedMode, ThemeConfig } from "./types";

const STORAGE_KEY_MODE = "life-log-theme-mode";
const STORAGE_KEY_THEME = "life-log-theme-key";

interface ThemeContextValue {
  theme: ThemeConfig;
  themeKey: string;
  mode: Mode;
  resolvedMode: ResolvedMode;
  isDark: boolean;
  setThemeKey: (key: string) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStored<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return (localStorage.getItem(key) as T) || fallback;
}

interface ProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ProviderProps> = ({ children }) => {
  const [themeKey, setThemeKeyState] = useState<string>(() =>
    readStored(STORAGE_KEY_THEME, DEFAULT_THEME_KEY)
  );
  const [mode, setModeState] = useState<Mode>(() =>
    readStored<Mode>(STORAGE_KEY_MODE, "auto")
  );
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(() =>
    resolveMode(readStored<Mode>(STORAGE_KEY_MODE, "auto"))
  );

  const theme = useMemo(() => getTheme(themeKey), [themeKey]);

  // Re-resolve when mode changes; if theme doesn't support dark, force light.
  useEffect(() => {
    const r = resolveMode(mode);
    const effective: ResolvedMode = theme.supportsDark ? r : "light";
    setResolvedMode(effective);
  }, [mode, theme]);

  // Apply on every change
  useEffect(() => {
    applyTheme(theme, resolvedMode);
  }, [theme, resolvedMode]);

  // Auto mode: re-check time once a minute
  useEffect(() => {
    if (mode !== "auto") return;
    const id = setInterval(() => {
      const r = resolveMode("auto");
      const effective: ResolvedMode = theme.supportsDark ? r : "light";
      setResolvedMode((prev) => (prev === effective ? prev : effective));
    }, 60_000);
    return () => clearInterval(id);
  }, [mode, theme]);

  const setThemeKey = useCallback((key: string) => {
    setThemeKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_THEME, key);
    }
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MODE, m);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const value: ThemeContextValue = {
    theme,
    themeKey,
    mode,
    resolvedMode,
    isDark: resolvedMode === "dark",
    setThemeKey,
    setMode,
    toggleMode,
    availableThemes: listThemes(),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}

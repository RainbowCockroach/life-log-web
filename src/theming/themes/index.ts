import type { ThemeConfig } from "../types";
import { classicTheme } from "./classic";
import { minimalTheme } from "./minimal";
import { polaroidTheme } from "./polaroid";
import { midnightTheme } from "./midnight";

export const THEMES: Record<string, ThemeConfig> = {
  [classicTheme.key]: classicTheme,
  [minimalTheme.key]: minimalTheme,
  [polaroidTheme.key]: polaroidTheme,
  [midnightTheme.key]: midnightTheme,
};

export const DEFAULT_THEME_KEY = classicTheme.key;

export function getTheme(key: string | null | undefined): ThemeConfig {
  if (key && THEMES[key]) return THEMES[key];
  return THEMES[DEFAULT_THEME_KEY];
}

export function listThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}

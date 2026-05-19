import type { ThemeConfig, TokenSet } from "../types";

const SANS =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const light: TokenSet = {
  colors: {
    text: "#111111",
    textMuted: "#666666",
    textFaint: "#bbbbbb",
    accent: "#111111",
    background: "#fafafa",
    paper: "#ffffff",
    border: "#e5e5e5",
    error: "#dc2626",
    success: "#16a34a",
  },
  typography: {
    body: { family: SANS, size: "15px", weight: 400, lineHeight: 1.7 },
    heading: { family: SANS, size: "18px", weight: 600, lineHeight: 1.3 },
    date: { family: SANS, size: "12px", weight: 500, lineHeight: 1.3, letterSpacing: "0.05em" },
    tag: { family: SANS, size: "11px", weight: 500, lineHeight: 1, letterSpacing: "0.04em" },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, monospace",
      size: "13px",
      weight: 400,
      lineHeight: 1.5,
    },
  },
  spacing: { unit: 4 },
  radii: { sm: 0, md: 0, lg: 0, pill: 999 },
  borders: {
    thin: { width: "1px", style: "solid", color: "#e5e5e5" },
    thick: { width: "1px", style: "solid", color: "#111111" },
    accent: { width: "1px", style: "solid", color: "#111111" },
  },
  shadows: { sm: "none", md: "none", lg: "none" },
};

const dark: TokenSet = {
  ...light,
  colors: {
    text: "#f5f5f5",
    textMuted: "#a3a3a3",
    textFaint: "#525252",
    accent: "#f5f5f5",
    background: "#0a0a0a",
    paper: "#141414",
    border: "#262626",
    error: "#f87171",
    success: "#4ade80",
  },
  borders: {
    thin: { width: "1px", style: "solid", color: "#262626" },
    thick: { width: "1px", style: "solid", color: "#f5f5f5" },
    accent: { width: "1px", style: "solid", color: "#f5f5f5" },
  },
};

export const minimalTheme: ThemeConfig = {
  key: "minimal",
  name: "Minimal",
  schemaVersion: 1,
  supportsDark: true,
  tokens: { light, dark },
  components: {
    page: { background: { kind: "solid", color: "#fafafa" } },
    entryFrame: { variant: "none", paddingScale: "loose" },
    image: { variant: "rounded", caption: "none" },
    tag: { shape: "underline", style: "outline" },
    date: { style: "stamp" },
    dayDivider: { variant: "line" },
    link: { variant: "underline" },
  },
  layout: { entry: "stacked", maxWidth: 680 },
  formatting: {
    dateFormat: "MMM D, YYYY",
    timeFormat: "HH:mm",
    locale: "en-US",
  },
  export: {
    pageSize: "A5",
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    showTags: true,
    showLocation: false,
  },
};

import type { ThemeConfig, TokenSet } from "../types";

const SERIF = "Georgia, 'Times New Roman', serif";

const lightTokens: TokenSet = {
  colors: {
    text: "#000000",
    textMuted: "#777676",
    textFaint: "#aaaaaa",
    accent: "#3b82f6",
    background: "#ffffff",
    paper: "#ffffff",
    border: "#cccccc",
    error: "#dc2626",
    success: "#10b981",
  },
  typography: {
    body: { family: SERIF, size: "16px", weight: 400, lineHeight: 1.6 },
    heading: { family: SERIF, size: "20px", weight: 700, lineHeight: 1.3 },
    date: { family: SERIF, size: "14px", weight: 400, lineHeight: 1.3 },
    tag: { family: SERIF, size: "12px", weight: 500, lineHeight: 1 },
    mono: {
      family: "ui-monospace, SFMono-Regular, Menlo, monospace",
      size: "14px",
      weight: 400,
      lineHeight: 1.4,
    },
  },
  spacing: { unit: 4 },
  radii: { sm: 2, md: 4, lg: 8, pill: 999 },
  borders: {
    thin: { width: "1px", style: "solid", color: "#cccccc" },
    thick: { width: "2px", style: "solid", color: "#777676" },
    accent: { width: "2px", style: "solid", color: "#3b82f6" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 2px 6px rgba(0,0,0,0.1)",
    lg: "0 8px 24px rgba(0,0,0,0.15)",
  },
};

const darkTokens: TokenSet = {
  ...lightTokens,
  colors: {
    text: "#e6edf3",
    textMuted: "#8b949e",
    textFaint: "#656d76",
    accent: "#58a6ff",
    background: "#0d1117",
    paper: "#0d1117",
    border: "#30363d",
    error: "#f85149",
    success: "#2ea043",
  },
  borders: {
    thin: { width: "1px", style: "solid", color: "#30363d" },
    thick: { width: "2px", style: "solid", color: "#8b949e" },
    accent: { width: "2px", style: "solid", color: "#58a6ff" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.4)",
    md: "0 2px 6px rgba(0,0,0,0.5)",
    lg: "0 8px 24px rgba(0,0,0,0.6)",
  },
};

export const classicTheme: ThemeConfig = {
  key: "classic",
  name: "Classic",
  schemaVersion: 1,
  supportsDark: true,
  tokens: { light: lightTokens, dark: darkTokens },
  components: {
    page: { background: { kind: "solid", color: "#ffffff" } },
    entryFrame: { variant: "none", paddingScale: "normal" },
    image: { variant: "plain", caption: "none" },
    tag: { shape: "pill", style: "soft" },
    date: { style: "inline" },
    dayDivider: { variant: "none" },
    link: { variant: "underline" },
  },
  layout: { entry: "stacked", maxWidth: 800 },
  formatting: {
    dateFormat: "MMM D, YYYY",
    timeFormat: "HH:mm",
    locale: "en-US",
  },
  export: {
    pageSize: "A5",
    margins: { top: 5, right: 5, bottom: 5, left: 25 },
    showTags: true,
    showLocation: true,
  },
};

import type { ThemeConfig, TokenSet } from "../types";

const SANS =
  "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const dark: TokenSet = {
  colors: {
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textFaint: "#475569",
    accent: "#a78bfa",
    background: "#0b1020",
    paper: "#111831",
    border: "#1e2746",
    error: "#fb7185",
    success: "#34d399",
  },
  typography: {
    body: { family: SANS, size: "14px", weight: 400, lineHeight: 1.7 },
    heading: { family: SANS, size: "16px", weight: 600, lineHeight: 1.3 },
    date: { family: SANS, size: "12px", weight: 400, lineHeight: 1.3, letterSpacing: "0.08em" },
    tag: { family: SANS, size: "11px", weight: 500, lineHeight: 1, letterSpacing: "0.06em" },
    mono: { family: SANS, size: "13px", weight: 400, lineHeight: 1.5 },
  },
  spacing: { unit: 4 },
  radii: { sm: 2, md: 6, lg: 10, pill: 999 },
  borders: {
    thin: { width: "1px", style: "solid", color: "#1e2746" },
    thick: { width: "1px", style: "solid", color: "#a78bfa" },
    accent: { width: "2px", style: "solid", color: "#a78bfa" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.4)",
    md: "0 4px 16px rgba(167,139,250,0.1)",
    lg: "0 12px 40px rgba(167,139,250,0.15)",
  },
};

export const midnightTheme: ThemeConfig = {
  key: "midnight",
  name: "Midnight",
  schemaVersion: 1,
  supportsDark: true,
  // Theme is dark-first: both modes use the dark palette.
  tokens: { light: dark, dark },
  components: {
    page: {
      background: {
        kind: "gradient",
        from: "#0b1020",
        to: "#161e3f",
        angle: 180,
      },
    },
    entryFrame: { variant: "card", paddingScale: "normal" },
    image: { variant: "rounded", caption: "none" },
    tag: { shape: "rounded", style: "outline" },
    date: { style: "margin" },
    dayDivider: { variant: "dotted" },
    link: { variant: "colored" },
  },
  layout: { entry: "margin-time", maxWidth: 760 },
  formatting: {
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm",
    locale: "en-US",
  },
  export: {
    pageSize: "A5",
    // PDFs follow the dark palette for this theme on purpose.
    followScreenMode: true,
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    showTags: true,
    showLocation: true,
  },
};

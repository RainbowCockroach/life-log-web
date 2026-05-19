import type { ThemeConfig, TokenSet } from "../types";

const HAND = "'Caveat', 'Patrick Hand', 'Marker Felt', cursive";
const SERIF = "'Lora', Georgia, serif";

const light: TokenSet = {
  colors: {
    text: "#2b2118",
    textMuted: "#7a6a5a",
    textFaint: "#b8a896",
    accent: "#c2410c",
    background: "#f4ead8",
    paper: "#fdf8ec",
    border: "#d4c4a8",
    error: "#b91c1c",
    success: "#4d7c0f",
  },
  typography: {
    body: { family: SERIF, size: "16px", weight: 400, lineHeight: 1.7 },
    heading: { family: HAND, size: "26px", weight: 500, lineHeight: 1.2 },
    date: { family: HAND, size: "20px", weight: 500, lineHeight: 1.2 },
    tag: { family: HAND, size: "16px", weight: 500, lineHeight: 1 },
    mono: {
      family: "ui-monospace, monospace",
      size: "14px",
      weight: 400,
      lineHeight: 1.4,
    },
  },
  spacing: { unit: 4 },
  radii: { sm: 2, md: 4, lg: 8, pill: 999 },
  borders: {
    thin: { width: "1px", style: "solid", color: "#d4c4a8" },
    thick: { width: "8px", style: "solid", color: "#fdf8ec" },
    accent: { width: "2px", style: "solid", color: "#c2410c" },
  },
  shadows: {
    sm: "0 1px 3px rgba(80,55,30,0.15)",
    md: "0 4px 12px rgba(80,55,30,0.2)",
    lg: "0 12px 32px rgba(80,55,30,0.25)",
  },
};

export const polaroidTheme: ThemeConfig = {
  key: "polaroid",
  name: "Polaroid",
  schemaVersion: 1,
  supportsDark: false,
  tokens: { light },
  components: {
    page: {
      background: {
        kind: "gradient",
        from: "#efe2c6",
        to: "#f7eed8",
        angle: 135,
      },
    },
    entryFrame: { variant: "polaroid", paddingScale: "loose" },
    image: { variant: "polaroid", caption: "below" },
    tag: { shape: "ticket", style: "soft" },
    date: { style: "stamp" },
    dayDivider: { variant: "ornament" },
    link: { variant: "colored" },
  },
  layout: { entry: "stacked", maxWidth: 720 },
  formatting: {
    dateFormat: "MMMM D, YYYY",
    timeFormat: "h:mm A",
    locale: "en-US",
  },
  export: {
    pageSize: "A5",
    margins: { top: 12, right: 12, bottom: 12, left: 12 },
    showTags: true,
    showLocation: true,
  },
};

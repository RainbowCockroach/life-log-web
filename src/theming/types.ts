// Theming type definitions — single source of truth for both web and PDF.
//
// Three layers:
//   1. Tokens     — atomic values (colors, fonts, spacing, radii, borders, shadows)
//   2. Components — themable elements that pick a closed-enum variant + reference tokens
//   3. Layout    — high-level structural choices (entry layout, max width)

export type Mode = "light" | "dark" | "auto";
export type ResolvedMode = "light" | "dark";

// ---------- Backgrounds ----------

export type BackgroundSpec =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | {
      kind: "image";
      asset: string; // URL or imported asset path
      repeat: "tile" | "cover" | "contain";
      opacity?: number;
    };

// ---------- Tokens ----------

export interface FontSpec {
  family: string;
  size: string; // e.g., "16px", "1rem"
  weight: number; // 400, 500, 700...
  lineHeight: number;
  letterSpacing?: string;
}

export interface BorderSpec {
  width: string; // "1px"
  style: "solid" | "dashed" | "dotted" | "double";
  color: string;
}

export interface TokenColors {
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  background: string;
  paper: string;
  border: string;
  error: string;
  success: string;
}

export interface TokenSet {
  colors: TokenColors;
  typography: {
    body: FontSpec;
    heading: FontSpec;
    date: FontSpec;
    tag: FontSpec;
    mono: FontSpec;
  };
  spacing: { unit: number }; // base unit in px; named steps derived
  radii: { sm: number; md: number; lg: number; pill: number };
  borders: { thin: BorderSpec; thick: BorderSpec; accent: BorderSpec };
  shadows: { sm: string; md: string; lg: string };
}

// ---------- Component variants (closed enums) ----------

export type EntryFrameVariant =
  | "none"
  | "card"
  | "bordered"
  | "polaroid"
  | "paper";

export type ImageVariant = "plain" | "framed" | "polaroid" | "rounded";
export type ImageCaption = "none" | "below" | "overlay";

export type TagShape =
  | "pill"
  | "square"
  | "rounded"
  | "ticket"
  | "underline";
export type TagStyle = "solid" | "outline" | "soft";

export type DateStyle = "inline" | "stamp" | "margin" | "header-banner";

export type DayDividerVariant = "none" | "line" | "dotted" | "ornament";

export type LinkVariant = "underline" | "colored" | "bracketed";

export type PaddingScale = "tight" | "normal" | "loose";

export type EntryLayout = "stacked" | "margin-time" | "two-column";

export interface ComponentConfig {
  page: { background: BackgroundSpec };
  entryFrame: {
    variant: EntryFrameVariant;
    paddingScale: PaddingScale;
    background?: BackgroundSpec;
  };
  image: {
    variant: ImageVariant;
    caption: ImageCaption;
  };
  tag: {
    shape: TagShape;
    style: TagStyle;
  };
  date: {
    style: DateStyle;
  };
  dayDivider: {
    variant: DayDividerVariant;
    ornamentAsset?: string;
  };
  link: {
    variant: LinkVariant;
  };
}

// ---------- Top-level theme ----------

export interface ThemeFormatting {
  dateFormat: string;
  timeFormat: string;
  locale: string;
}

export interface ThemeExport {
  pageSize: "A4" | "A5" | "Letter";
  margins: { top: number; right: number; bottom: number; left: number };
  showTags: boolean;
  showLocation: boolean;
  // PDFs default to light mode regardless of screen mode unless this is true.
  followScreenMode?: boolean;
  // Optional overrides applied on top of components when exporting.
  overrides?: Partial<ComponentConfig>;
}

export interface ThemeConfig {
  key: string;
  name: string;
  schemaVersion: 1;

  // Whether this theme provides a separate dark token set.
  // If false, the mode toggle is effectively disabled for this theme.
  supportsDark: boolean;

  tokens: {
    light: TokenSet;
    dark?: TokenSet;
  };

  components: ComponentConfig;
  layout: {
    entry: EntryLayout;
    maxWidth: number; // in px
  };

  formatting: ThemeFormatting;
  export: ThemeExport;
}

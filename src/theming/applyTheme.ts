// Apply a resolved ThemeConfig + mode to the DOM.
//
// Tokens become CSS custom properties on :root.
// Component variants become data-* attributes on <body>, so CSS can target them.

import type {
  BackgroundSpec,
  FontSpec,
  ResolvedMode,
  ThemeConfig,
  TokenSet,
} from "./types";

const PADDING_SCALE: Record<string, number> = {
  tight: 2,
  normal: 4,
  loose: 6,
};

function fontVars(prefix: string, f: FontSpec): Record<string, string> {
  return {
    [`--font-${prefix}-family`]: f.family,
    [`--font-${prefix}-size`]: f.size,
    [`--font-${prefix}-weight`]: String(f.weight),
    [`--font-${prefix}-line-height`]: String(f.lineHeight),
    [`--font-${prefix}-letter-spacing`]: f.letterSpacing ?? "normal",
  };
}

function tokenVars(t: TokenSet): Record<string, string> {
  const c = t.colors;
  return {
    "--color-text": c.text,
    "--color-text-muted": c.textMuted,
    "--color-text-faint": c.textFaint,
    "--color-accent": c.accent,
    "--color-background": c.background,
    "--color-paper": c.paper,
    "--color-border": c.border,
    "--color-error": c.error,
    "--color-success": c.success,

    ...fontVars("body", t.typography.body),
    ...fontVars("heading", t.typography.heading),
    ...fontVars("date", t.typography.date),
    ...fontVars("tag", t.typography.tag),
    ...fontVars("mono", t.typography.mono),

    "--spacing-unit": `${t.spacing.unit}px`,
    "--radius-sm": `${t.radii.sm}px`,
    "--radius-md": `${t.radii.md}px`,
    "--radius-lg": `${t.radii.lg}px`,
    "--radius-pill": `${t.radii.pill}px`,

    "--border-thin": `${t.borders.thin.width} ${t.borders.thin.style} ${t.borders.thin.color}`,
    "--border-thick": `${t.borders.thick.width} ${t.borders.thick.style} ${t.borders.thick.color}`,
    "--border-accent": `${t.borders.accent.width} ${t.borders.accent.style} ${t.borders.accent.color}`,

    "--shadow-sm": t.shadows.sm,
    "--shadow-md": t.shadows.md,
    "--shadow-lg": t.shadows.lg,

    // Back-compat aliases for legacy default.css selectors.
    "--text-color": c.text,
    "--secondary-color": c.textMuted,
    "--thirdary-color": c.textFaint,
    "--paper-color": c.paper,
    "--background-color": c.background,
    "--border-color": c.border,
    "--accent-color": c.accent,
    "--input-background": c.paper,
    "--input-border": c.border,
    "--error-text": c.error,
    "--error-border": c.error,
    "--success-text": c.success,
    "--success-border": c.success,
    "--button-background": c.paper,
    "--button-hover-background": c.border,
    "--shadow-color": "rgba(0,0,0,0.1)",
    "--font-family": t.typography.body.family,
    "--font-size": t.typography.body.size,
    "--line-height": String(t.typography.body.lineHeight),
  };
}

export function backgroundToCss(spec: BackgroundSpec): string {
  switch (spec.kind) {
    case "solid":
      return spec.color;
    case "gradient":
      return `linear-gradient(${spec.angle}deg, ${spec.from}, ${spec.to})`;
    case "image": {
      const size = spec.repeat === "tile" ? "auto" : spec.repeat;
      const repeat = spec.repeat === "tile" ? "repeat" : "no-repeat";
      return `url("${spec.asset}") center / ${size} ${repeat}`;
    }
  }
}

export function resolveMode(mode: "light" | "dark" | "auto"): ResolvedMode {
  if (mode === "light" || mode === "dark") return mode;
  // auto: time-based, 18:00 to 07:00 = dark
  const h = new Date().getHours();
  return h >= 18 || h < 7 ? "dark" : "light";
}

export function pickTokens(
  theme: ThemeConfig,
  resolved: ResolvedMode
): TokenSet {
  if (resolved === "dark" && theme.supportsDark && theme.tokens.dark) {
    return theme.tokens.dark;
  }
  return theme.tokens.light;
}

export function applyTheme(
  theme: ThemeConfig,
  resolved: ResolvedMode
): void {
  if (typeof document === "undefined") return;

  const tokens = pickTokens(theme, resolved);
  const root = document.documentElement;
  const body = document.body;

  // 1. CSS variables from tokens
  const vars = tokenVars(tokens);
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }

  // 2. Page background
  root.style.setProperty(
    "--page-background",
    backgroundToCss(theme.components.page.background)
  );

  // 3. Entry frame padding scale
  const padMultiplier = PADDING_SCALE[theme.components.entryFrame.paddingScale];
  root.style.setProperty(
    "--entry-padding",
    `calc(var(--spacing-unit) * ${padMultiplier})`
  );

  // 4. Optional entry frame background
  if (theme.components.entryFrame.background) {
    root.style.setProperty(
      "--entry-frame-background",
      backgroundToCss(theme.components.entryFrame.background)
    );
  } else {
    root.style.removeProperty("--entry-frame-background");
  }

  // 5. Layout
  root.style.setProperty("--layout-max-width", `${theme.layout.maxWidth}px`);

  // 6. Component variant data attributes on <body>
  body.setAttribute("data-theme-key", theme.key);
  body.setAttribute("data-mode", resolved);
  body.setAttribute("data-entry-frame", theme.components.entryFrame.variant);
  body.setAttribute("data-entry-layout", theme.layout.entry);
  body.setAttribute("data-image", theme.components.image.variant);
  body.setAttribute("data-image-caption", theme.components.image.caption);
  body.setAttribute("data-tag-shape", theme.components.tag.shape);
  body.setAttribute("data-tag-style", theme.components.tag.style);
  body.setAttribute("data-date-style", theme.components.date.style);
  body.setAttribute("data-day-divider", theme.components.dayDivider.variant);
  body.setAttribute("data-link", theme.components.link.variant);

  // Back-compat with existing dark-mode CSS that targets [data-theme="dark"]
  root.setAttribute("data-theme", resolved);
}

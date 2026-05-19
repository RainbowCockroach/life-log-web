# Design Guidelines — life-log-web

This document defines the visual + interaction conventions for the diary frontend. **Follow it whenever you add or modify UI.** The goal is one coherent aesthetic that survives across four user-selectable themes (Classic, Minimal, Polaroid, Midnight) and both light/dark modes.

---

## 1. First principles

1. **Minimal chrome.** The diary content is the product; UI controls should recede. Prefer ghost styles (transparent background, no border at rest) over boxed pills.
2. **Token-driven, never hardcoded.** Colors, spacing, fonts, radii, shadows, and borders all come from CSS custom properties defined per theme. If you find yourself typing a hex color in component CSS or JSX, stop — use a token.
3. **One row, responsive density.** Toolbars and navs must fit on a single line on a 320px-wide viewport. Achieve this by shrinking padding/gap/icon-size, not by wrapping.
4. **Mobile-first.** Default styles target small screens; widen at breakpoints, not the other way around.
5. **Theme-agnostic.** Anything you build must look correct under all 4 themes × {light, dark} without per-theme overrides. Verify by switching the ThemePicker dropdown.

---

## 2. Design tokens

All tokens are CSS custom properties materialized by `src/theming/applyTheme.ts`. **Use these names** — do not invent new variables in component CSS.

### Color
| Token | Use |
|---|---|
| `--color-text` | Primary text |
| `--color-text-muted` | Secondary text, captions, dates |
| `--color-text-faint` | Tertiary text, placeholders, dividers |
| `--color-accent` | Active state, links, primary action emphasis |
| `--color-background` | App background fallback |
| `--color-paper` | Cards, surfaces, sticky nav, entry frames |
| `--color-border` | Hairline borders, dividers |
| `--color-error` | Danger states (missing API key, destructive actions) |
| `--color-success` | Confirmations |
| `--page-background` | Body background (may be a gradient — set by theme) |

### Spacing
- `--spacing-unit` is the atomic unit (theme decides, usually 4px).
- Compose with `calc(var(--spacing-unit) * N)` for theme-aware spacing.
- For nav/toolbar density, raw px (2/4/8) is acceptable when you need to be tighter than the unit allows.

### Radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill` — controls round per theme. **Never hardcode `border-radius`.**

### Typography
- `--font-body-family`, `--font-body-size`, `--font-body-line-height`
- `--font-heading-*`, `--font-date-*`, `--font-tag-*`, `--font-mono-*`
- A theme might use a handwritten display font (Polaroid) or a strict sans (Minimal). Inherit from the body and override only when the surface is semantically a heading/date/tag.

### Borders & shadows
- `--border-thin`, `--border-thick`, `--border-accent` (shorthand strings)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`

### Layout
- `--layout-max-width` — used by `.page-container` to constrain text columns per theme (Polaroid is narrower than Minimal, etc.).

---

## 3. Components

### Buttons / links / selects (default)
- Use the **ghost pattern**: transparent background, no border, tinted hover.
- Active/selected state: `background: color-mix(in srgb, var(--color-accent) 12%, transparent); color: var(--color-accent);` — no border swap.
- Hover: `background: color-mix(in srgb, var(--color-text) 8%, transparent);`
- Focus: `outline: 2px solid var(--color-accent); outline-offset: 1px;` on `:focus-visible` only.
- Min height **30px** in nav, **36-40px** in forms.
- Border-radius: `var(--radius-md)`.
- Font-size **13px** in nav, **14-16px** in forms (≥14px on inputs prevents iOS zoom-on-focus).

### Inputs
- Same ghost pattern; add a 1px border using `--color-border` for affordance.
- Background: `transparent` or `color-mix(in srgb, var(--color-text) 4%, transparent)` for filled fields.
- Selects: hide native chevron and draw one with two linear-gradient triangles (see `NavBar.css`) — works across themes because it uses `currentColor`.

### Tags
- Style is theme-driven via `body[data-tag-shape="..."]` and `body[data-tag-style="..."]`. Do **not** style `.tag` directly outside `variants.css`. Add `.tag` class and let the theme decide pill vs ticket vs underline.

### Entry cards
- Style via `body[data-entry-frame="..."]`. Add `.entry` class; do not impose `border`/`background`/`box-shadow` from a page-level component.

### Icons — Lucide only
- Library: `lucide-react`. Do **not** add `react-icons`, FontAwesome, emoji icons, or inline SVGs for UI affordances. Emoji is reserved for user-authored content.
- Sizes: **16px** in nav/toolbars, **18-20px** in body content, **24px+** for hero/empty states.
- Icon color inherits `currentColor` — never set `color` on the icon itself; let the parent pill/button drive it.
- Icon-only buttons **must** carry both `title` (tooltip) and `aria-label` (screen reader).

### Sticky nav (`.app-nav`)
- Single row, `flex-wrap: nowrap`.
- Background: `color-mix(in srgb, var(--color-paper) 88%, transparent)` + `backdrop-filter: saturate(140%) blur(8px)` so it floats over scrolling content.
- Border-bottom: `1px solid var(--color-border)`.
- No box-shadow (the blur + border read clearly enough).

---

## 4. Layout rules

- `App.tsx` sets `height: 100vh`, `flex-direction: column`, with the nav as a sticky child and a single content `<div>` below holding the `<Routes>`.
- Every page root uses `<div className="page-container">`. **Do not nest a second wrapper that re-imposes padding or max-width.** `.page-container` already applies `padding: 16px`, `max-width: var(--layout-max-width)`, and `margin: 0 auto`.
- Zero `body` margin is global (in `variants.css`). Never re-add it.
- For full-bleed sections (e.g., a hero image that should reach the edges on mobile), use negative margins inside `.page-container` rather than escaping the wrapper.

---

## 5. Light / dark / theme parity

- Dark mode toggles via `[data-theme="dark"]` on the root. Most tokens flip automatically; you don't need to write a dark variant if you only use tokens.
- For surfaces that need to read on **any** background, prefer `color-mix(in srgb, var(--color-text) N%, transparent)` over a fixed gray. The mix follows the text color, which already inverts with the theme.
- Polaroid has `supportsDark: false`. If you author something that only works in dark, gate it on `[data-theme="dark"]`.
- **Test matrix before merging UI work:** Classic light, Classic dark, Polaroid (light only), Midnight dark, Minimal light. Open ThemePicker and cycle through — the bar should remain legible and contrast-safe in all five.

---

## 6. Accessibility

- All icon-only controls: `aria-label` + `title`.
- Interactive elements use `:focus-visible` for the accent outline (never `:focus`, which would flash on click).
- Color is never the sole carrier of state. Active nav has both a tint and the icon's accent color; danger has both red and the destructive copy in `aria-label`.
- Minimum interactive size 30×30 in nav (tight but acceptable for desktop-leaning users); **44×44** for primary mobile actions inside pages.

---

## 7. What NOT to do

- ❌ Hardcoded hex / rgb colors in component CSS or JSX inline styles (except `#fff`/`#000` over a known-accent background, e.g. `nav-pill--danger` white-on-red).
- ❌ Inline `style={{ backgroundColor, border, padding, fontSize }}` for theming — use a CSS class with tokens. Inline styles override CSS and break the theme system.
- ❌ `!important` in component CSS. If you need it, the root cause is an inline style or a too-specific selector — fix that instead.
- ❌ Heavy boxed controls (full border + chunky padding) in toolbars and nav. Reserve borders for inputs, dropdowns, and form fields.
- ❌ Emoji as UI icons (☀️ 🌙 📝). Use Lucide. (Emoji in user content is fine.)
- ❌ Margins/padding on `<body>` or `<html>`.
- ❌ A second `react-icons`-style icon library — bundle bloat and visual inconsistency.
- ❌ New CSS custom properties in component files. Add tokens to the theme system if a new one is genuinely needed.

---

## 8. Where things live

```
src/
  themes/default.css         # base CSS reset, .page-container, .entry base
  theming/
    variants.css             # body[data-*] rules that pick component variants
    applyTheme.ts            # writes tokens → CSS vars on :root
    ThemeProvider.tsx        # context + persistence
    themes/                  # one file per theme (classic, minimal, polaroid, midnight)
  components/
    NavBar.tsx + NavBar.css  # pattern: component-scoped CSS file next to .tsx
    ThemePicker.tsx          # consumed by NavBar — uses .app-nav select styles
    ThemeToggle.tsx          # ditto
```

When you add a new shared component, put its CSS in a sibling `Component.css` file and `import "./Component.css"` from the `.tsx`. Don't dump rules into `default.css` unless they're truly global.

---

## 9. Quick reference — copy-paste-able ghost button

```css
.my-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 8px;
  font: inherit;
  font-size: 13px;
  color: var(--color-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}
.my-control:hover {
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}
.my-control:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
.my-control[aria-pressed="true"],
.my-control.is-active {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}
```

If you reach for anything heavier than this, ask why first.

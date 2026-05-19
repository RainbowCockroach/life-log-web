import { useThemeContext } from "../theming/ThemeProvider";

export function ThemePicker() {
  const { themeKey, setThemeKey, availableThemes } = useThemeContext();

  return (
    <select
      value={themeKey}
      onChange={(e) => setThemeKey(e.target.value)}
      aria-label="Select theme"
    >
      {availableThemes.map((t) => (
        <option key={t.key} value={t.key}>
          {t.name}
        </option>
      ))}
    </select>
  );
}

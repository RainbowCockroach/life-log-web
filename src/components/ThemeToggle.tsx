import React from "react";
import { useThemeContext } from "../contexts/ThemeContext";
import type { Theme } from "../hooks/useTheme";

interface ThemeToggleProps {
  variant?: "button" | "select" | "toggle";
  showLabels?: boolean;
}

/**
 * Theme toggle component that allows users to switch between light, dark, and auto themes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "button",
  showLabels = true,
}) => {
  const { theme, resolvedTheme, setTheme, isAuto } = useThemeContext();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const getThemeIcon = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "auto":
        return "🌗";
      default:
        return "☀️";
    }
  };

  const getThemeLabel = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "auto":
        return "Auto";
      default:
        return "Light";
    }
  };

  if (variant === "select") {
    return (
      <select
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as Theme)}
        style={{
          backgroundColor: "var(--input-background)",
          color: "var(--text-color)",
          border: "1px solid var(--input-border)",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "14px",
        }}
        aria-label="Select theme"
      >
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="auto">🌗 Auto</option>
      </select>
    );
  }

  if (variant === "toggle") {
    return (
      <button
        onClick={() => {
          // Cycle through themes: light → dark → auto → light
          const nextTheme: Theme =
            theme === "light" ? "dark" : theme === "dark" ? "auto" : "light";
          handleThemeChange(nextTheme);
        }}
        style={{
          backgroundColor: "var(--button-background)",
          color: "var(--text-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "14px",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            "var(--button-hover-background)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--button-background)";
        }}
        aria-label={`Current theme: ${getThemeLabel(theme)}${
          isAuto ? ` (${resolvedTheme})` : ""
        }. Click to change.`}
        title={`Current: ${getThemeLabel(theme)}${
          isAuto ? ` (currently ${resolvedTheme})` : ""
        }`}
      >
        <span style={{ fontSize: "16px" }}>{getThemeIcon(theme)}</span>
        {showLabels && (
          <span>
            {getThemeLabel(theme)}
            {isAuto && (
              <span
                style={{
                  color: "var(--secondary-color)",
                  fontSize: "12px",
                  marginLeft: "4px",
                }}
              >
                ({resolvedTheme})
              </span>
            )}
          </span>
        )}
      </button>
    );
  }

  // Default button variant - individual buttons for each theme
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        alignItems: "center",
      }}
      role="group"
      aria-label="Theme selection"
    >
      {(["light", "dark", "auto"] as Theme[]).map((themeOption) => (
        <button
          key={themeOption}
          onClick={() => handleThemeChange(themeOption)}
          style={{
            backgroundColor:
              theme === themeOption
                ? "var(--button-hover-background)"
                : "var(--button-background)",
            color: "var(--text-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            transition: "background-color 0.2s ease",
            minWidth: showLabels ? "60px" : "30px",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (theme !== themeOption) {
              e.currentTarget.style.backgroundColor =
                "var(--button-hover-background)";
            }
          }}
          onMouseLeave={(e) => {
            if (theme !== themeOption) {
              e.currentTarget.style.backgroundColor =
                "var(--button-background)";
            }
          }}
          aria-label={`Set theme to ${getThemeLabel(themeOption)}`}
          aria-pressed={theme === themeOption}
        >
          <span>{getThemeIcon(themeOption)}</span>
          {showLabels && <span>{getThemeLabel(themeOption)}</span>}
        </button>
      ))}
      {isAuto && (
        <span
          style={{
            color: "var(--secondary-color)",
            fontSize: "11px",
            marginLeft: "4px",
          }}
        >
          ({resolvedTheme})
        </span>
      )}
    </div>
  );
};

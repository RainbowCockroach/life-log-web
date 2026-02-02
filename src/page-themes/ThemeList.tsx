import React from "react";
import type { Theme } from "../services/api";

interface ThemeListProps {
  themes: Theme[];
  onEdit: (theme: Theme) => void;
  onDelete: (themeId: number) => void;
  onSetDefault: (themeId: number) => void;
  onDuplicate: (theme: Theme) => void;
  onExport: (theme: Theme) => void;
}

const ThemeList: React.FC<ThemeListProps> = ({
  themes,
  onEdit,
  onDelete,
  onSetDefault,
  onDuplicate,
  onExport,
}) => {
  if (themes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--secondary-color)" }}>
        No themes yet. Create one to get started.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onEdit={() => onEdit(theme)}
          onDelete={() => onDelete(theme.id)}
          onSetDefault={() => onSetDefault(theme.id)}
          onDuplicate={() => onDuplicate(theme)}
          onExport={() => onExport(theme)}
        />
      ))}
    </div>
  );
};

interface ThemeCardProps {
  theme: Theme;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onDuplicate: () => void;
  onExport: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  onEdit,
  onDelete,
  onSetDefault,
  onDuplicate,
  onExport,
}) => {
  const { colors, darkColors } = theme.config;

  return (
    <div
      style={{
        border: `2px solid ${theme.isDefault ? colors.accent : "var(--border-color)"}`,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "var(--paper-color)",
      }}
    >
      {/* Color preview */}
      <div style={{ display: "flex", height: 60 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: colors.text, fontSize: 12 }}>Light</span>
          </div>
          <div style={{ height: 8, display: "flex" }}>
            <div style={{ flex: 1, backgroundColor: colors.accent }} />
            <div style={{ flex: 1, backgroundColor: colors.success }} />
            <div style={{ flex: 1, backgroundColor: colors.error }} />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, backgroundColor: darkColors.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: darkColors.text, fontSize: 12 }}>Dark</span>
          </div>
          <div style={{ height: 8, display: "flex" }}>
            <div style={{ flex: 1, backgroundColor: darkColors.accent }} />
            <div style={{ flex: 1, backgroundColor: darkColors.success }} />
            <div style={{ flex: 1, backgroundColor: darkColors.error }} />
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{theme.name}</h3>
          {theme.isDefault && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                backgroundColor: colors.accent,
                color: "white",
                borderRadius: 10,
              }}
            >
              Active
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: "var(--secondary-color)", marginBottom: 12 }}>
          <div>Font: {theme.config.typography.fontFamily.split(",")[0]}</div>
          <div>Export: {theme.config.export.pageSize}, {theme.config.export.fontFamily.split(",")[0]}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={onEdit}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              backgroundColor: "var(--button-background)",
              border: "1px solid var(--border-color)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          {!theme.isDefault && (
            <button
              onClick={onSetDefault}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                backgroundColor: "var(--button-background)",
                border: "1px solid var(--border-color)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Set Active
            </button>
          )}
          <button
            onClick={onDuplicate}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              backgroundColor: "var(--button-background)",
              border: "1px solid var(--border-color)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Duplicate
          </button>
          <button
            onClick={onExport}
            style={{
              padding: "4px 12px",
              fontSize: 12,
              backgroundColor: "var(--button-background)",
              border: "1px solid var(--border-color)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Export
          </button>
          {!theme.isDefault && (
            <button
              onClick={onDelete}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                backgroundColor: "var(--error-background)",
                border: "1px solid var(--error-border)",
                color: "var(--error-text)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeList;

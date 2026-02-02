import React, { useState } from "react";
import type { Theme, ThemeConfig, ThemeColors, ThemeFormatting, CreateThemeRequest } from "../services/api";

// Default formatting for backward compatibility with themes that don't have it
const DEFAULT_FORMATTING: ThemeFormatting = {
  dateFormat: "MMM D, YYYY",
  timeFormat: "HH:mm",
  locale: "en-US",
};

interface ThemeEditorProps {
  theme: Theme | null;
  defaultConfig: ThemeConfig;
  onSave: (data: CreateThemeRequest) => void;
  onCancel: () => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({
  theme,
  defaultConfig,
  onSave,
  onCancel,
}) => {
  const isNew = !theme || theme.id === 0;
  const [name, setName] = useState(theme?.name || "New Theme");
  // Merge theme config with defaults to handle missing fields (backward compatibility)
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const base = theme?.config || defaultConfig;
    return {
      ...base,
      formatting: base.formatting || DEFAULT_FORMATTING,
    };
  });
  const [activeTab, setActiveTab] = useState<"colors" | "darkColors" | "typography" | "formatting" | "export">("colors");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Theme name is required");
      return;
    }
    onSave({ name, config });
  };

  const updateColors = (key: keyof ThemeColors, value: string, isDark = false) => {
    const colorKey = isDark ? "darkColors" : "colors";
    setConfig((prev) => ({
      ...prev,
      [colorKey]: { ...prev[colorKey], [key]: value },
    }));
  };

  const updateTypography = (key: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }));
  };

  const updateExport = (key: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      export: { ...prev.export, [key]: value },
    }));
  };

  const updateMargin = (key: string, value: number) => {
    setConfig((prev) => ({
      ...prev,
      export: {
        ...prev.export,
        margins: { ...prev.export.margins, [key]: value },
      },
    }));
  };

  const updateFormatting = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      formatting: { ...prev.formatting, [key]: value },
    }));
  };

  const tabs = [
    { id: "colors" as const, label: "Light Colors" },
    { id: "darkColors" as const, label: "Dark Colors" },
    { id: "typography" as const, label: "Typography" },
    { id: "formatting" as const, label: "Date/Time" },
    { id: "export" as const, label: "Export" },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        backgroundColor: "var(--paper-color)",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Theme name"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--text-color)",
            outline: "none",
            width: "100%",
            maxWidth: 300,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--button-background)",
              border: "1px solid var(--border-color)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--accent-color, #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--button-background)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-color, #3b82f6)" : "2px solid transparent",
              backgroundColor: activeTab === tab.id ? "var(--paper-color)" : "transparent",
              color: activeTab === tab.id ? "var(--text-color)" : "var(--secondary-color)",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 500 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {(activeTab === "colors" || activeTab === "darkColors") && (
          <ColorEditor
            colors={activeTab === "colors" ? config.colors : config.darkColors}
            onChange={(key, value) => updateColors(key, value, activeTab === "darkColors")}
            isDark={activeTab === "darkColors"}
          />
        )}

        {activeTab === "typography" && (
          <TypographyEditor
            typography={config.typography}
            onChange={updateTypography}
          />
        )}

        {activeTab === "formatting" && (
          <FormattingEditor
            formatting={config.formatting}
            onChange={updateFormatting}
          />
        )}

        {activeTab === "export" && (
          <ExportEditor
            exportConfig={config.export}
            onChange={updateExport}
            onMarginChange={updateMargin}
          />
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--button-background)",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--secondary-color)", marginBottom: 8 }}>Preview</div>
        <div style={{ display: "flex", gap: 16 }}>
          <PreviewPane colors={config.colors} typography={config.typography} label="Light" />
          <PreviewPane colors={config.darkColors} typography={config.typography} label="Dark" />
        </div>
      </div>
    </div>
  );
};

// Color Editor Component
interface ColorEditorProps {
  colors: ThemeColors;
  onChange: (key: keyof ThemeColors, value: string) => void;
  isDark: boolean;
}

const ColorEditor: React.FC<ColorEditorProps> = ({ colors, onChange }) => {
  const colorFields: { key: keyof ThemeColors; label: string }[] = [
    { key: "text", label: "Text" },
    { key: "secondary", label: "Secondary Text" },
    { key: "tertiary", label: "Tertiary Text" },
    { key: "background", label: "Background" },
    { key: "paper", label: "Paper/Card" },
    { key: "border", label: "Border" },
    { key: "accent", label: "Accent" },
    { key: "error", label: "Error" },
    { key: "success", label: "Success" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {colorFields.map(({ key, label }) => (
        <div key={key}>
          <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
            {label}
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => onChange(key, e.target.value)}
              style={{ width: 40, height: 32, border: "1px solid var(--border-color)", borderRadius: 4, cursor: "pointer" }}
            />
            <input
              type="text"
              value={colors[key]}
              onChange={(e) => onChange(key, e.target.value)}
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid var(--border-color)",
                borderRadius: 4,
                backgroundColor: "var(--input-background)",
                color: "var(--text-color)",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Typography Editor Component
interface TypographyEditorProps {
  typography: ThemeConfig["typography"];
  onChange: (key: string, value: string | number) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ typography, onChange }) => {
  const fontOptions = [
    "system-ui, -apple-system, sans-serif",
    "Georgia, serif",
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "'Times New Roman', serif",
    "'Courier New', monospace",
    "'Segoe UI', sans-serif",
    "'Roboto', sans-serif",
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Font Family
        </label>
        <select
          value={typography.fontFamily}
          onChange={(e) => onChange("fontFamily", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          {fontOptions.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0].replace(/'/g, "")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Font Size
        </label>
        <input
          type="text"
          value={typography.fontSize}
          onChange={(e) => onChange("fontSize", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Line Height
        </label>
        <input
          type="number"
          step="0.1"
          value={typography.lineHeight}
          onChange={(e) => onChange("lineHeight", parseFloat(e.target.value))}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Heading Font
        </label>
        <select
          value={typography.headingFont}
          onChange={(e) => onChange("headingFont", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          <option value="inherit">Same as body</option>
          {fontOptions.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0].replace(/'/g, "")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Formatting Editor Component
interface FormattingEditorProps {
  formatting: ThemeConfig["formatting"];
  onChange: (key: string, value: string) => void;
}

const FormattingEditor: React.FC<FormattingEditorProps> = ({ formatting: formattingProp, onChange }) => {
  // Fallback for backward compatibility
  const formatting = formattingProp || DEFAULT_FORMATTING;

  const dateFormats = [
    { value: "MMM D, YYYY", label: "Jan 15, 2024", example: "Jan 15, 2024" },
    { value: "MMMM D, YYYY", label: "January 15, 2024", example: "January 15, 2024" },
    { value: "D MMM YYYY", label: "15 Jan 2024", example: "15 Jan 2024" },
    { value: "YYYY-MM-DD", label: "2024-01-15", example: "2024-01-15" },
    { value: "DD/MM/YYYY", label: "15/01/2024", example: "15/01/2024" },
    { value: "MM/DD/YYYY", label: "01/15/2024", example: "01/15/2024" },
    { value: "ddd, MMM D, YYYY", label: "Mon, Jan 15, 2024", example: "Mon, Jan 15, 2024" },
    { value: "dddd, MMMM D, YYYY", label: "Monday, January 15, 2024", example: "Monday, January 15, 2024" },
  ];

  const timeFormats = [
    { value: "HH:mm", label: "14:30 (24h)", example: "14:30" },
    { value: "HH:mm:ss", label: "14:30:45 (24h with seconds)", example: "14:30:45" },
    { value: "hh:mm A", label: "02:30 PM (12h)", example: "02:30 PM" },
    { value: "h:mm A", label: "2:30 PM (12h, no leading zero)", example: "2:30 PM" },
    { value: "hh:mm:ss A", label: "02:30:45 PM (12h with seconds)", example: "02:30:45 PM" },
  ];

  const locales = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "vi-VN", label: "Vietnamese" },
    { value: "fr-FR", label: "French" },
    { value: "de-DE", label: "German" },
    { value: "es-ES", label: "Spanish" },
    { value: "ja-JP", label: "Japanese" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
    { value: "ko-KR", label: "Korean" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Date Format
        </label>
        <select
          value={formatting.dateFormat}
          onChange={(e) => onChange("dateFormat", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          {dateFormats.map((format) => (
            <option key={format.value} value={format.value}>
              {format.example}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--tertiary-color)", marginTop: 4 }}>
          Format: {formatting.dateFormat}
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Time Format
        </label>
        <select
          value={formatting.timeFormat}
          onChange={(e) => onChange("timeFormat", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          {timeFormats.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--tertiary-color)", marginTop: 4 }}>
          Format: {formatting.timeFormat}
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Locale
        </label>
        <select
          value={formatting.locale}
          onChange={(e) => onChange("locale", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          {locales.map((locale) => (
            <option key={locale.value} value={locale.value}>
              {locale.label}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--tertiary-color)", marginTop: 4 }}>
          Affects month/day names in exports
        </div>
      </div>

      {/* Custom format inputs */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Custom Date Format (optional)
        </label>
        <input
          type="text"
          value={formatting.dateFormat}
          onChange={(e) => onChange("dateFormat", e.target.value)}
          placeholder="e.g., YYYY-MM-DD or MMM D, YYYY"
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
            fontFamily: "monospace",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--tertiary-color)", marginTop: 4 }}>
          Tokens: YYYY (year), MM/M (month), MMM/MMMM (month name), DD/D (day), ddd/dddd (weekday)
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Custom Time Format (optional)
        </label>
        <input
          type="text"
          value={formatting.timeFormat}
          onChange={(e) => onChange("timeFormat", e.target.value)}
          placeholder="e.g., HH:mm or hh:mm A"
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
            fontFamily: "monospace",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--tertiary-color)", marginTop: 4 }}>
          Tokens: HH/H (24h), hh/h (12h), mm/m (minutes), ss/s (seconds), A/a (AM/PM)
        </div>
      </div>
    </div>
  );
};

// Export Editor Component
interface ExportEditorProps {
  exportConfig: ThemeConfig["export"];
  onChange: (key: string, value: unknown) => void;
  onMarginChange: (key: string, value: number) => void;
}

const ExportEditor: React.FC<ExportEditorProps> = ({ exportConfig, onChange, onMarginChange }) => {
  const fontOptions = [
    "Georgia, serif",
    "'Times New Roman', serif",
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "'Courier New', monospace",
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Page Size
        </label>
        <select
          value={exportConfig.pageSize}
          onChange={(e) => onChange("pageSize", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="Letter">Letter</option>
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Font Family
        </label>
        <select
          value={exportConfig.fontFamily}
          onChange={(e) => onChange("fontFamily", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        >
          {fontOptions.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0].replace(/'/g, "")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Font Size
        </label>
        <input
          type="text"
          value={exportConfig.fontSize}
          onChange={(e) => onChange("fontSize", e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 4 }}>
          Line Height
        </label>
        <input
          type="number"
          step="0.1"
          value={exportConfig.lineHeight}
          onChange={(e) => onChange("lineHeight", parseFloat(e.target.value))}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            backgroundColor: "var(--input-background)",
            color: "var(--text-color)",
          }}
        />
      </div>

      {/* Margins */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", fontSize: 12, color: "var(--secondary-color)", marginBottom: 8 }}>
          Margins (mm)
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <div key={side} style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--tertiary-color)", marginBottom: 2 }}>
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </label>
              <input
                type="number"
                value={exportConfig.margins[side]}
                onChange={(e) => onMarginChange(side, parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: 4,
                  backgroundColor: "var(--input-background)",
                  color: "var(--text-color)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Toggle options */}
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={exportConfig.showTags}
            onChange={(e) => onChange("showTags", e.target.checked)}
          />
          Show tags in export
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={exportConfig.showLocation}
            onChange={(e) => onChange("showLocation", e.target.checked)}
          />
          Show location in export
        </label>
      </div>
    </div>
  );
};

// Preview Pane Component
interface PreviewPaneProps {
  colors: ThemeColors;
  typography: ThemeConfig["typography"];
  label: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ colors, typography, label }) => {
  return (
    <div
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 6,
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        lineHeight: typography.lineHeight,
      }}
    >
      <div style={{ fontSize: 10, color: colors.tertiary, marginBottom: 8 }}>{label}</div>
      <div style={{ color: colors.text, marginBottom: 4 }}>Primary text</div>
      <div style={{ color: colors.secondary, marginBottom: 4, fontSize: "0.9em" }}>Secondary text</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <span style={{ padding: "2px 8px", borderRadius: 4, backgroundColor: colors.accent, color: "white", fontSize: 11 }}>
          Accent
        </span>
        <span style={{ padding: "2px 8px", borderRadius: 4, backgroundColor: colors.success, color: "white", fontSize: 11 }}>
          Success
        </span>
        <span style={{ padding: "2px 8px", borderRadius: 4, backgroundColor: colors.error, color: "white", fontSize: 11 }}>
          Error
        </span>
      </div>
    </div>
  );
};

export default ThemeEditor;

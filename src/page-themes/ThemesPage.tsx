import React, { useState, useEffect } from "react";
import ThemeList from "./ThemeList";
import ThemeEditor from "./ThemeEditor";
import { useThemeContext } from "../contexts/ThemeContext";
import {
  fetchThemes,
  fetchDefaultThemeConfig,
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme,
  type Theme,
  type ThemeConfig,
  type CreateThemeRequest,
} from "../services/api";

const ThemesPage: React.FC = () => {
  const { reloadCustomTheme } = useThemeContext();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState<ThemeConfig | null>(null);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const [fetchedThemes, config] = await Promise.all([
        fetchThemes(),
        fetchDefaultThemeConfig(),
      ]);
      setThemes(fetchedThemes);
      setDefaultConfig(config);
    } catch {
      setError("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleCreate = () => {
    setEditingTheme(null);
    setShowEditor(true);
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setShowEditor(true);
  };

  const handleDelete = async (themeId: number) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      try {
        await deleteTheme(themeId);
        await loadThemes();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete theme");
      }
    }
  };

  const handleSetDefault = async (themeId: number) => {
    try {
      await setDefaultTheme(themeId);
      await loadThemes();
      reloadCustomTheme(); // Refresh the active theme
    } catch {
      alert("Failed to set default theme");
    }
  };

  const handleSave = async (data: CreateThemeRequest) => {
    try {
      if (editingTheme) {
        await updateTheme(editingTheme.id, data);
      } else {
        await createTheme(data);
      }
      setShowEditor(false);
      await loadThemes();
      reloadCustomTheme(); // Refresh the active theme in case it was modified
    } catch {
      alert("Failed to save theme");
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTheme(null);
  };

  const handleDuplicate = (theme: Theme) => {
    setEditingTheme({
      ...theme,
      id: 0, // Mark as new
      name: `${theme.name} (Copy)`,
      isDefault: false,
    });
    setShowEditor(true);
  };

  const handleExport = (theme: Theme) => {
    const dataStr = JSON.stringify(
      { name: theme.name, config: theme.config },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-${theme.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!imported.name || !imported.config) {
        throw new Error("Invalid theme file format");
      }

      await createTheme({
        name: imported.name,
        config: imported.config,
      });
      await loadThemes();
      alert("Theme imported successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to import theme");
    }

    event.target.value = "";
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Themes</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <label
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--button-background)",
              border: "1px solid var(--border-color)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={handleCreate}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--accent-color, #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Create New Theme
          </button>
        </div>
      </div>

      {showEditor && defaultConfig && (
        <ThemeEditor
          theme={editingTheme}
          defaultConfig={defaultConfig}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {!showEditor && (
        <ThemeList
          themes={themes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
          onDuplicate={handleDuplicate}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default ThemesPage;

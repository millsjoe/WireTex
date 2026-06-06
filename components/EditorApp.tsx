"use client";

import { useCallback, useMemo, useState } from "react";
import { parseWireTex } from "@/lib/parse";
import { render } from "@/lib/renderer";
import {
  createCustomTheme,
  defaultThemes,
  type Theme,
} from "@/lib/themes";
import { SAMPLE_WIRETEX } from "@/lib/sample";
import { AppToolbar } from "@/components/AppToolbar";
import { ThemePanel } from "@/components/ThemePanel";
import { WireframePreview } from "@/components/WireframePreview";

type Device = "web" | "mobile";

export function EditorApp() {
  const [source, setSource] = useState(SAMPLE_WIRETEX);
  const [device, setDevice] = useState<Device>("web");
  const [themeId, setThemeId] = useState(defaultThemes[0].id);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  const activeTheme = useMemo(() => {
    if (themeId === "custom" && customTheme) return customTheme;
    return defaultThemes.find((t) => t.id === themeId) ?? defaultThemes[0];
  }, [themeId, customTheme]);

  const { html, error } = useMemo(() => {
    try {
      const ast = parseWireTex(source);
      return { html: render(ast), error: null as string | null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Parse error";
      return { html: "", error: message };
    }
  }, [source]);

  const handleThemeChange = useCallback((id: string) => {
    setThemeId(id);
    if (id !== "custom") {
      setCustomTheme(null);
      setShowThemeEditor(false);
    }
  }, []);

  const handleCustomiseToggle = useCallback(() => {
    if (showThemeEditor) {
      setShowThemeEditor(false);
      return;
    }

    setCustomTheme((prev) =>
      prev ?? createCustomTheme("Custom", themeId === "custom" ? "sketch" : themeId)
    );
    setThemeId("custom");
    setShowThemeEditor(true);
  }, [showThemeEditor, themeId]);

  const handleThemeVarChange = useCallback((key: string, value: string) => {
    setCustomTheme((prev) => {
      const base =
        prev ??
        createCustomTheme("Custom", themeId === "custom" ? "sketch" : themeId);
      return {
        ...base,
        vars: { ...base.vars, [key]: value },
      };
    });
    setThemeId("custom");
    setShowThemeEditor(true);
  }, [themeId]);

  const handleDeviceChange = useCallback((next: Device) => {
    setDevice(next);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>WireTex</h1>
            <p>Live wireframe markup editor</p>
          </div>
          <AppToolbar
            themeId={themeId}
            customTheme={customTheme}
            showThemeEditor={showThemeEditor}
            device={device}
            onThemeChange={handleThemeChange}
            onCustomiseToggle={handleCustomiseToggle}
            onDeviceChange={handleDeviceChange}
          />
        </div>
        {showThemeEditor && customTheme && (
          <ThemePanel theme={customTheme} onVarChange={handleThemeVarChange} />
        )}
      </header>

      <main className="app-main">
        <section className="panel panel-editor">
          <div className="panel-header">Markup</div>
          <textarea
            className="editor-textarea"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            aria-label="WireTex markup"
          />
          {error && <pre className="parse-error">{error}</pre>}
        </section>

        <section className="panel panel-preview">
          <div className="panel-header">Preview</div>
          <WireframePreview
            html={html}
            themeVars={activeTheme.vars}
            device={device}
          />
        </section>
      </main>
    </div>
  );
}

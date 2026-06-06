"use client";

import { useEffect, useState } from "react";
import type { Theme } from "@/lib/themes";
import { themeFieldLabels, themeVarKeys } from "@/lib/themes";

interface ThemePanelProps {
  theme: Theme;
  onVarChange: (key: string, value: string) => void;
}

export function ThemePanel({ theme, onVarChange }: ThemePanelProps) {
  const [draft, setDraft] = useState(theme.vars);

  useEffect(() => {
    setDraft(theme.vars);
  }, [theme.vars]);

  function commit(key: string, value: string) {
    if (key === "shadow") {
      onVarChange(key, value.trim());
      return;
    }

    const normalised = normaliseHex(value);
    if (normalised) {
      onVarChange(key, normalised);
      setDraft((prev) => ({ ...prev, [key]: normalised }));
    }
  }

  return (
    <div className="theme-panel">
      <div className="theme-panel-title">Custom theme colours</div>
      <div className="theme-grid">
        {themeVarKeys.map((key) => (
          <label key={key} className="theme-field">
            <span className="theme-field-label">{themeFieldLabels[key]}</span>
            <div className="theme-field-row">
              {key !== "shadow" && (
                <span
                  className="theme-swatch"
                  style={{ background: draft[key] ?? "#000000" }}
                  aria-hidden="true"
                />
              )}
              <input
                type="text"
                className="theme-hex-input"
                value={draft[key] ?? ""}
                spellCheck={false}
                placeholder={key === "shadow" ? "rgba(0, 0, 0, 0.08)" : "#rrggbb"}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
                onBlur={(e) => commit(key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function normaliseHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

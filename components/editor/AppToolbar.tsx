"use client";

import { memo } from "react";
import { defaultThemes, type Theme } from "@/lib/site/themes";

type Device = "web" | "mobile";

interface AppToolbarProps {
  themeId: string;
  customTheme: Theme | null;
  showThemeEditor: boolean;
  device: Device;
  onThemeChange: (id: string) => void;
  onCustomiseToggle: () => void;
  onDeviceChange: (device: Device) => void;
}

export const AppToolbar = memo(function AppToolbar({
  themeId,
  customTheme,
  showThemeEditor,
  device,
  onThemeChange,
  onCustomiseToggle,
  onDeviceChange,
}: AppToolbarProps) {
  return (
    <div className="toolbar">
      <label>
        Theme
        <select
          value={themeId}
          onChange={(e) => onThemeChange(e.target.value)}
        >
          {defaultThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
          {(customTheme || themeId === "custom") && (
            <option value="custom">{customTheme?.name ?? "Custom"}</option>
          )}
        </select>
      </label>
      <button
        type="button"
        className={showThemeEditor ? "active" : ""}
        aria-pressed={showThemeEditor}
        onClick={onCustomiseToggle}
      >
        {showThemeEditor ? "Hide theme editor" : "Customise theme"}
      </button>
      <div className="device-toggle" role="group" aria-label="Preview device">
        <button
          type="button"
          className={device === "web" ? "active" : ""}
          aria-pressed={device === "web"}
          onClick={() => onDeviceChange("web")}
        >
          Web
        </button>
        <button
          type="button"
          className={device === "mobile" ? "active" : ""}
          aria-pressed={device === "mobile"}
          onClick={() => onDeviceChange("mobile")}
        >
          Mobile
        </button>
      </div>
    </div>
  );
});

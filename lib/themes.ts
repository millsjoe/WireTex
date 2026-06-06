import type { CSSProperties } from "react";

export interface Theme {
  id: string;
  name: string;
  vars: Record<string, string>;
}

export const themeVarKeys = [
  "bg",
  "text",
  "cardBg",
  "btnPrimaryBg",
  "btnPrimaryText",
  "btnSecondaryBg",
  "btnSecondaryText",
  "surface",
  "muted",
  "border",
  "accent",
  "accentText",
  "inputBg",
  "codeBg",
  "shadow",
] as const;

export type ThemeVarKey = (typeof themeVarKeys)[number];

export const themeFieldLabels: Record<ThemeVarKey, string> = {
  bg: "Page background",
  text: "Text",
  cardBg: "Card background",
  btnPrimaryBg: "Primary button",
  btnPrimaryText: "Primary button text",
  btnSecondaryBg: "Secondary button",
  btnSecondaryText: "Secondary button text",
  surface: "Surface",
  muted: "Muted text",
  border: "Border",
  accent: "Accent",
  accentText: "Accent text",
  inputBg: "Input background",
  codeBg: "Code background",
  shadow: "Shadow",
};

export const defaultThemes: Theme[] = [
  {
    id: "sketch",
    name: "Sketch",
    vars: {
      bg: "#f7f7f5",
      surface: "#ffffff",
      text: "#1a1a1a",
      muted: "#6b7280",
      border: "#2d2d2d",
      accent: "#2563eb",
      accentText: "#ffffff",
      inputBg: "#ffffff",
      codeBg: "#f0f0ec",
      shadow: "rgba(0, 0, 0, 0.08)",
      cardBg: "#ffffff",
      btnPrimaryBg: "#2563eb",
      btnPrimaryText: "#ffffff",
      btnSecondaryBg: "#ffffff",
      btnSecondaryText: "#1a1a1a",
    },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    vars: {
      bg: "#0f2744",
      surface: "#16365c",
      text: "#e8f1ff",
      muted: "#9bb8dc",
      border: "#5b8fd4",
      accent: "#38bdf8",
      accentText: "#0f2744",
      inputBg: "#1e4470",
      codeBg: "#122d4d",
      shadow: "rgba(0, 0, 0, 0.35)",
      cardBg: "#16365c",
      btnPrimaryBg: "#38bdf8",
      btnPrimaryText: "#0f2744",
      btnSecondaryBg: "#16365c",
      btnSecondaryText: "#e8f1ff",
    },
  },
  {
    id: "dark",
    name: "Dark",
    vars: {
      bg: "#111827",
      surface: "#1f2937",
      text: "#f9fafb",
      muted: "#9ca3af",
      border: "#374151",
      accent: "#6366f1",
      accentText: "#ffffff",
      inputBg: "#111827",
      codeBg: "#0b1220",
      shadow: "rgba(0, 0, 0, 0.45)",
      cardBg: "#1f2937",
      btnPrimaryBg: "#6366f1",
      btnPrimaryText: "#ffffff",
      btnSecondaryBg: "#1f2937",
      btnSecondaryText: "#f9fafb",
    },
  },
  {
    id: "paper",
    name: "Paper",
    vars: {
      bg: "#faf6ef",
      surface: "#fffdf8",
      text: "#2c2416",
      muted: "#7a6f5c",
      border: "#c9b99a",
      accent: "#b45309",
      accentText: "#fffdf8",
      inputBg: "#fffdf8",
      codeBg: "#f3ead8",
      shadow: "rgba(44, 36, 22, 0.1)",
      cardBg: "#fffdf8",
      btnPrimaryBg: "#b45309",
      btnPrimaryText: "#fffdf8",
      btnSecondaryBg: "#fffdf8",
      btnSecondaryText: "#2c2416",
    },
  },
];

export function themeToStyle(vars: Record<string, string>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    style[`--wt-${key}`] = value;
  }
  return style as CSSProperties;
}

export function createCustomTheme(name: string, baseId: string): Theme {
  const base = defaultThemes.find((t) => t.id === baseId) ?? defaultThemes[0];
  return {
    id: "custom",
    name,
    vars: { ...base.vars },
  };
}

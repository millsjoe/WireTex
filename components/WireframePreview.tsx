"use client";

import { useEffect, useRef } from "react";
import { DeviceFrame } from "@/components/DeviceFrame";
import { themeToStyle } from "@/lib/themes";

interface WireframePreviewProps {
  html: string;
  themeVars: Record<string, string>;
  device: "web" | "mobile";
}

export function WireframePreview({
  html,
  themeVars,
  device,
}: WireframePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Imperative DOM update keeps React from reconciling parsed markup,
  // which can otherwise break event handlers on sibling/header nodes.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    root.innerHTML = html;

    const blockNavigation = (event: Event) => {
      event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest('input[type="file"]')
      ) {
        blockNavigation(event);
      }
    };

    root.addEventListener("click", onClick);
    root.addEventListener("submit", blockNavigation, true);

    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", blockNavigation, true);
    };
  }, [html]);

  return (
    <div className="preview-shell">
      <DeviceFrame device={device}>
        <div
          ref={contentRef}
          className="wiretex-content"
          style={themeToStyle(themeVars)}
        />
      </DeviceFrame>
    </div>
  );
}

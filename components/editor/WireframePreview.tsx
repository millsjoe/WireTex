"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceFrame } from "@/components/editor/DeviceFrame";
import {
  downloadElementAsPng,
  wiretexPreviewFilename,
} from "@/lib/preview/download-preview";
import { themeToStyle } from "@/lib/site/themes";

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
  const captureRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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

  const handleDownload = useCallback(async () => {
    const target = captureRef.current;
    if (!target || !html) {
      return;
    }

    setDownloadError(null);
    setIsDownloading(true);

    try {
      await downloadElementAsPng(target, wiretexPreviewFilename(device));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not export preview";
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  }, [device, html]);

  return (
    <div className="preview-shell">
      <div className="preview-toolbar">
        <button
          type="button"
          className="preview-download-btn"
          onClick={handleDownload}
          disabled={!html || isDownloading}
          aria-label="Download preview as PNG"
        >
          {isDownloading ? "Exporting…" : "Download PNG"}
        </button>
        {downloadError && (
          <span className="preview-download-error" role="status">
            {downloadError}
          </span>
        )}
      </div>

      <div ref={captureRef} className="preview-capture">
        <DeviceFrame device={device}>
          <div
            ref={contentRef}
            className="wiretex-content"
            style={themeToStyle(themeVars)}
          />
        </DeviceFrame>
      </div>
    </div>
  );
}

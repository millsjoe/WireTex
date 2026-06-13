import { toPng } from "html-to-image";

export async function downloadElementAsPng(
  element: HTMLElement,
  filename = "wiretex-preview.png",
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function wiretexPreviewFilename(device: "web" | "mobile"): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `wiretex-${device}-${stamp}.png`;
}

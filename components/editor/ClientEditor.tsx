"use client";

import dynamic from "next/dynamic";

const EditorApp = dynamic(
  () => import("@/components/editor/EditorApp").then((mod) => mod.EditorApp),
  {
    ssr: false,
    loading: () => (
      <div className="app-loading">Loading editor…</div>
    ),
  }
);

export function ClientEditor() {
  return <EditorApp />;
}

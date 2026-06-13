"use client";

import dynamic from "next/dynamic";

const ChatApp = dynamic(
  () => import("@/components/chat/ChatApp").then((mod) => mod.ChatApp),
  {
    ssr: false,
    loading: () => <div className="app-loading">Loading generator…</div>,
  },
);

export function ClientChat() {
  return <ChatApp />;
}

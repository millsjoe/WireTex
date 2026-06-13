import { ClientChat } from "@/components/chat/ClientChat";
import { SiteNav } from "@/components/layout/SiteNav";

export default function ChatPage() {
  return (
    <div className="sandbox-shell">
      <SiteNav current="chat" compact />
      <div className="sandbox-editor">
        <ClientChat />
      </div>
    </div>
  );
}

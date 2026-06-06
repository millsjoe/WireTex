import { ClientEditor } from "@/components/ClientEditor";
import { SiteNav } from "@/components/SiteNav";

export default function SandboxPage() {
  return (
    <div className="sandbox-shell">
      <SiteNav current="sandbox" compact />
      <div className="sandbox-editor">
        <ClientEditor />
      </div>
    </div>
  );
}

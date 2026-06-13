import { ClientEditor } from "@/components/editor/ClientEditor";
import { SiteNav } from "@/components/layout/SiteNav";

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

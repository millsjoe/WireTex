import type { ReactNode } from "react";

interface DocsHeadingProps {
  id: string;
  as: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}

export function DocsHeading({
  id,
  as: Tag,
  className,
  children,
}: DocsHeadingProps) {
  return (
    <Tag
      id={id}
      className={["docs-heading", className].filter(Boolean).join(" ")}
    >
      <a href={`#${id}`} className="docs-heading-link">
        <span className="docs-heading-text">{children}</span>
        <span className="docs-heading-anchor" aria-hidden="true">
          #
        </span>
      </a>
    </Tag>
  );
}

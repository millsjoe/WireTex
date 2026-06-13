"use client";

import { useState } from "react";
import { slugifyCategory, type DocCategory } from "@/lib/site/docs";

interface DocsSidebarProps {
  categories: DocCategory[];
}

export function DocsSidebar({ categories }: DocsSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((category) => [category.title, false])),
  );

  function toggleGroup(title: string) {
    setOpenGroups((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="docs-sidebar-inner">
        <p className="docs-sidebar-label">On this page</p>
        <nav className="docs-sidebar-nav">
          {categories.map((category) => {
            const categoryId = slugifyCategory(category.title);
            const isOpen = openGroups[category.title] ?? false;

            return (
              <div
                key={category.title}
                className={`docs-sidebar-group${isOpen ? " is-open" : ""}`}
              >
                <div className="docs-sidebar-group-header">
                  <a
                    href={`#${categoryId}`}
                    className="docs-sidebar-group-title"
                  >
                    {category.title}
                  </a>
                  <button
                    type="button"
                    className="docs-sidebar-toggle"
                    aria-expanded={isOpen}
                    aria-controls={`sidebar-${categoryId}`}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.title}`}
                    onClick={() => toggleGroup(category.title)}
                  >
                    <span className="docs-sidebar-chevron" aria-hidden="true" />
                  </button>
                </div>
                {isOpen ? (
                  <ul
                    id={`sidebar-${categoryId}`}
                    className="docs-sidebar-items"
                  >
                    {category.entries.map((entry) => (
                      <li key={entry.id}>
                        <a href={`#${entry.id}`}>{entry.title}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

import Link from "next/link";
import { DocsHeading } from "@/components/DocsHeading";
import { DocsSidebar } from "@/components/DocsSidebar";
import { SiteNav } from "@/components/SiteNav";
import { docCategories, slugifyCategory } from "@/lib/docs";

export default function DocsPage() {
  return (
    <div className="site-page docs-page">
      <SiteNav current="docs" />
      <div className="docs-layout">
        <DocsSidebar categories={docCategories} />
        <main className="docs-main">
          <header className="docs-header">
            <DocsHeading id="wiretex-syntax" as="h1">
              WireTex syntax
            </DocsHeading>
            <p>
              Every component supported by the grammar, with copy-paste snippets.
              Authoritative source:{" "}
              <code>lib/grammar.pegjs</code> and <code>lib/renderer.ts</code>.
            </p>
            <Link href="/sandbox" className="docs-sandbox-link">
              Try it in the sandbox →
            </Link>
          </header>

          <div className="docs-content">
            {docCategories.map((category) => {
              const categoryId = slugifyCategory(category.title);

              return (
                <section
                  key={category.title}
                  className="docs-category"
                  aria-labelledby={categoryId}
                >
                  <DocsHeading id={categoryId} as="h2">
                    {category.title}
                  </DocsHeading>
                  {category.entries.map((entry) => (
                    <article key={entry.id} className="docs-entry">
                      <DocsHeading id={entry.id} as="h3">
                        {entry.title}
                      </DocsHeading>
                      <p>{entry.description}</p>
                      {entry.notes && entry.notes.length > 0 && (
                        <ul className="docs-notes">
                          {entry.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      )}
                      <pre className="docs-syntax">
                        <code>{entry.syntax}</code>
                      </pre>
                    </article>
                  ))}
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

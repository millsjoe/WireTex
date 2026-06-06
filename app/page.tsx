import Link from "next/link";
import { LandingExample } from "@/components/LandingExample";
import { SiteNav } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <div className="site-page landing-page">
      <SiteNav current="home" />
      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-eyebrow">Wireframe markup language</p>
          <h1>Sketch UI layouts in plain text</h1>
          <p className="landing-lead">
            WireTex is a compact, markdown-like syntax for wireframes. Write markup,
            preview styled layouts instantly, and swap themes — no design tool required.
          </p>
          <div className="landing-actions">
            <Link href="/sandbox" className="landing-btn landing-btn-primary">
              Open sandbox
            </Link>
            <Link href="/docs" className="landing-btn">
              Read the docs
            </Link>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature">
            <h2>Line-oriented syntax</h2>
            <p>
              Headings, inputs, buttons, cards, tables, and more — each with a
              short token or block delimiter you can type from memory.
            </p>
          </div>
          <div className="landing-feature">
            <h2>Live preview</h2>
            <p>
              The sandbox parses on every keystroke and renders wireframe HTML with
              theme variables. Web and mobile device frames included.
            </p>
          </div>
          <div className="landing-feature">
            <h2>Extensible pipeline</h2>
            <p>
              Grammar in Peggy, AST to HTML renderer, swappable output. Same markup
              can target React, PDF, or anything else later.
            </p>
          </div>
        </section>

        <section className="landing-example">
          <h2>Quick example</h2>
          <LandingExample />
        </section>
      </main>
    </div>
  );
}
